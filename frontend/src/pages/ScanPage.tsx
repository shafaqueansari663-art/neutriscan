import { useState } from 'react'
import { CameraCapture } from '../components/scan/CameraCapture'
import { ImageUpload } from '../components/scan/ImageUpload'
import { scanFoodImage } from '../api/scan'
import * as logsApi from '../api/logsApi'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'
import type { NutritionScanResponse } from '../types'
import { ScanCalorieCoach } from '../components/scan/ScanCalorieCoach'
import './ScanPage.css'

type LogDecision = 'pending' | 'logged' | 'skipped'

function resultCard(r: NutritionScanResponse) {
  return (
    <div className="scan-result">
      <h3>{r.food_name}</h3>
      {r.portion_estimation ? <p className="scan-result__portion">{r.portion_estimation}</p> : null}
      <dl className="scan-result__macros">
        <div>
          <dt>Calories</dt>
          <dd>{Math.round(r.calories)}</dd>
        </div>
        <div>
          <dt>Protein</dt>
          <dd>{r.protein_g.toFixed(1)} g</dd>
        </div>
        <div>
          <dt>Carbs</dt>
          <dd>{r.carbs_g.toFixed(1)} g</dd>
        </div>
        <div>
          <dt>Fats</dt>
          <dd>{r.fats_g.toFixed(1)} g</dd>
        </div>
        {r.fiber_g != null && r.fiber_g > 0 ? (
          <div>
            <dt>Fiber</dt>
            <dd>{r.fiber_g.toFixed(1)} g</dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}

export function ScanPage() {
  const { user, refreshLogs } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<NutritionScanResponse | null>(null)
  const [logDecision, setLogDecision] = useState<LogDecision | null>(null)
  const [logSaving, setLogSaving] = useState(false)

  async function runScan(file: File) {
    if (!user) return
    setError('')
    setResult(null)
    setLogDecision(null)
    setLoading(true)
    try {
      const data = await scanFoodImage(file)
      setResult(data)
      setLogDecision('pending')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  async function commitLog() {
    if (!user || !result) return
    setLogSaving(true)
    setError('')
    try {
      const now = new Date()
      await logsApi.apiAppendLog({
        id: crypto.randomUUID(),
        date: format(now, 'yyyy-MM-dd'),
        time: format(now, 'HH:mm:ss'),
        food_name: result.food_name,
        calories: result.calories,
        protein_g: result.protein_g,
        carbohydrates_g: result.carbs_g,
        fats_g: result.fats_g,
        fiber_g: result.fiber_g ?? 0,
      })
      await refreshLogs()
      setLogDecision('logged')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save meal')
    } finally {
      setLogSaving(false)
    }
  }

  function skipLog() {
    setLogDecision('skipped')
  }

  function clearResult() {
    setResult(null)
    setLogDecision(null)
  }

  return (
    <div className="scan-page">
      <header className="scan-page__head">
        <h1>Nutritional scan</h1>
        <p className="scan-page__sub">
          After analysis, choose whether you&apos;re eating this meal so your server-backed log and dashboard
          stay accurate.
        </p>
      </header>

      <section className="scan-page__panel">
        <div className="scan-page__actions">
          <CameraCapture onCapture={runScan} disabled={loading || logDecision === 'pending'} />
          <ImageUpload onFile={runScan} disabled={loading || logDecision === 'pending'} />
        </div>
        {loading ? <p className="scan-page__status">Analyzing image…</p> : null}
        {error ? <div className="scan-page__error">{error}</div> : null}
        {result ? (
          <>
            {resultCard(result)}
            {user && logDecision === 'pending' ? (
              <>
                <ScanCalorieCoach user={user} mealCalories={result.calories} committed={false} />
                <div className="scan-page__decision">
                  <p className="scan-page__decision-q">Are you going to eat this meal?</p>
                  <div className="scan-page__decision-btns">
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => void commitLog()}
                      disabled={logSaving}
                    >
                      {logSaving ? 'Saving…' : 'Yes — log it to my day'}
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={skipLog} disabled={logSaving}>
                      No — don&apos;t add to dashboard
                    </button>
                  </div>
                  <button type="button" className="btn btn--ghost scan-page__discard" onClick={clearResult}>
                    Discard scan
                  </button>
                </div>
              </>
            ) : null}
            {user && logDecision === 'logged' ? (
              <>
                <ScanCalorieCoach user={user} mealCalories={result.calories} committed />
                <div className="scan-page__decision-done scan-page__decision-done--ok" role="status">
                  Saved to your account. Open <strong>Dashboard</strong> for updated calories and charts.
                </div>
                <button type="button" className="btn btn--ghost scan-page__new-scan" onClick={clearResult}>
                  Scan another meal
                </button>
              </>
            ) : null}
            {user && logDecision === 'skipped' ? (
              <>
                <ScanCalorieCoach user={user} mealCalories={result.calories} committed={false} />
                <div className="scan-page__decision-done scan-page__decision-done--skip" role="status">
                  You chose not to log this meal — your server log and heatmap are unchanged. The coach above is
                  a &quot;what if&quot; preview only.
                </div>
                <button type="button" className="btn btn--ghost scan-page__new-scan" onClick={clearResult}>
                  Scan another meal
                </button>
              </>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  )
}
