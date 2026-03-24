'use client'

import { useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { TradingPlanInput, TradingPlanSchema, INSTRUMENTS, PROP_FIRM_TEMPLATES } from '@/lib/schemas/tradingPlan'
import { cn } from '@/lib/utils'
import { ZodError } from 'zod'

export default function TradingPlanPage() {
  const [formData, setFormData] = useState<Partial<TradingPlanInput>>({
    title: 'My Trading Plan',
    description: '',
    maxRiskPerTrade: 1,
    maxDailyLoss: 3,
    maxDailyLossDollars: 0,
    maxTotalDrawdown: 10,
    maxTradesPerDay: 5,
    maxConcurrentPositions: 3,
    minRiskRewardRatio: '1:1.5',
    tradingHoursStart: '09:00',
    tradingHoursEnd: '17:00',
    maxPositionSizeLots: 1,
    allowedInstruments: ['EUR/USD'],
    cooldownAfterLossMinutes: 15,
    maxConsecutiveLossesBeforePause: 3,
    stopLossRequired: true,
    propFirmMode: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [propFirmOpen, setPropFirmOpen] = useState(false)
  const [accountBalance, setAccountBalance] = useState(10000)

  const validateForm = () => {
    try {
      TradingPlanSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleInstrumentToggle = (instrument: string) => {
    setFormData((prev) => {
      const current = prev.allowedInstruments || []
      const updated = current.includes(instrument)
        ? current.filter((i) => i !== instrument)
        : [...current, instrument]
      return { ...prev, allowedInstruments: updated }
    })
  }

  const handlePropFirmTemplate = (template: 'FTMO' | 'MyForexFunds' | 'TheFundedTrader') => {
    const config = PROP_FIRM_TEMPLATES[template]
    handleInputChange('propFirmTemplate', template)
    handleInputChange('propFirmDailyDrawdown', config.dailyDrawdown)
    handleInputChange('propFirmMaxDrawdown', config.maxDrawdown)
    handleInputChange('propFirmProfitTarget', config.profitTarget)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await response.json()
        setErrors({ form: data.error || 'Failed to save plan' })
      }
    } catch (error) {
      setErrors({ form: 'An error occurred while saving' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Trading Plan Builder</h1>
        <p className="mt-2 text-slate-400">
          Create your personalized trading plan. This is mandatory before you can start monitoring.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-green-800 bg-green-900/30 p-4 text-green-300">
          ✓ Trading plan saved successfully!
        </div>
      )}

      {/* Form Errors */}
      {errors.form && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-4 text-red-300">
          {errors.form}
        </div>
      )}

      {/* Mandatory Notice */}
      <div className="flex gap-3 rounded-lg border border-amber-800 bg-amber-900/30 p-4 text-amber-300">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm">
          Your trading plan must be saved before monitoring can begin. All 14 parameters are required.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-8">
        {/* Basic Info */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white">Plan Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., Conservative Daily Trader"
              />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Description (Optional)</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                placeholder="Notes about your trading strategy..."
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Risk Management */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">Risk Management</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Max Risk Per Trade (%)</span>
                <span className="text-lg font-bold text-blue-400">{formData.maxRiskPerTrade?.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={formData.maxRiskPerTrade || 1}
                onChange={(e) => handleInputChange('maxRiskPerTrade', parseFloat(e.target.value))}
                className="mt-3 w-full"
              />
              <p className="mt-1 text-xs text-slate-400">Recommended: 0.5 - 2%</p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Max Daily Loss (%)</span>
                <span className="text-lg font-bold text-blue-400">{formData.maxDailyLoss?.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={formData.maxDailyLoss || 3}
                onChange={(e) => handleInputChange('maxDailyLoss', parseFloat(e.target.value))}
                className="mt-3 w-full"
              />
              <p className="mt-1 text-xs text-slate-400">Recommended: 2 - 5%</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Max Daily Loss ($)</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={formData.maxDailyLossDollars || 0}
                  onChange={(e) => handleInputChange('maxDailyLossDollars', parseFloat(e.target.value))}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Absolute dollar amount"
                />
                <button
                  type="button"
                  onClick={() => {
                    const dollarAmount = (accountBalance * (formData.maxDailyLoss || 3)) / 100
                    handleInputChange('maxDailyLossDollars', Math.round(dollarAmount * 100) / 100)
                  }}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
                >
                  Auto-calc
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">Editable or auto-calculated from % and balance</p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Max Total Drawdown (%)</span>
                <span className="text-lg font-bold text-blue-400">{formData.maxTotalDrawdown?.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={formData.maxTotalDrawdown || 10}
                onChange={(e) => handleInputChange('maxTotalDrawdown', parseFloat(e.target.value))}
                className="mt-3 w-full"
              />
              <p className="mt-1 text-xs text-slate-400">Stop all trading if exceeded</p>
            </div>
          </div>
        </section>

        {/* Position Limits */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">Position Limits</h2>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-white">Max Trades Per Day</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.maxTradesPerDay || 5}
                onChange={(e) => handleInputChange('maxTradesPerDay', parseInt(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              {errors.maxTradesPerDay && <p className="mt-1 text-sm text-red-400">{errors.maxTradesPerDay}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Max Concurrent Positions</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.maxConcurrentPositions || 3}
                onChange={(e) => handleInputChange('maxConcurrentPositions', parseInt(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              {errors.maxConcurrentPositions && <p className="mt-1 text-sm text-red-400">{errors.maxConcurrentPositions}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Min Risk/Reward Ratio</label>
              <select
                value={formData.minRiskRewardRatio || '1:1.5'}
                onChange={(e) => handleInputChange('minRiskRewardRatio', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option>1:1</option>
                <option>1:1.5</option>
                <option>1:2</option>
                <option>1:3</option>
              </select>
            </div>
          </div>
        </section>

        {/* Trading Hours */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">Trading Hours</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white">Trading Hours Start</label>
              <input
                type="time"
                value={formData.tradingHoursStart || '09:00'}
                onChange={(e) => handleInputChange('tradingHoursStart', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Trading Hours End</label>
              <input
                type="time"
                value={formData.tradingHoursEnd || '17:00'}
                onChange={(e) => handleInputChange('tradingHoursEnd', e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Instruments */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">Allowed Instruments</h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {INSTRUMENTS.map((instrument) => (
              <label key={instrument} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={formData.allowedInstruments?.includes(instrument) || false}
                  onChange={() => handleInstrumentToggle(instrument)}
                  className="h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm text-white">{instrument}</span>
              </label>
            ))}
          </div>
          {errors.allowedInstruments && <p className="mt-2 text-sm text-red-400">{errors.allowedInstruments}</p>}
        </section>

        {/* Advanced Settings */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-6 text-lg font-semibold text-white">Advanced Settings</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white">Max Position Size (lots)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.maxPositionSizeLots || 1}
                onChange={(e) => handleInputChange('maxPositionSizeLots', parseFloat(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">Auto-suggested based on account & risk%</p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Cool-down After Loss (minutes)</span>
                <span className="text-lg font-bold text-blue-400">{formData.cooldownAfterLossMinutes}</span>
              </label>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={formData.cooldownAfterLossMinutes || 15}
                onChange={(e) => handleInputChange('cooldownAfterLossMinutes', parseInt(e.target.value))}
                className="mt-3 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Max Consecutive Losses Before Pause</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxConsecutiveLossesBeforePause || 3}
                onChange={(e) => handleInputChange('maxConsecutiveLossesBeforePause', parseInt(e.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.stopLossRequired || false}
                  onChange={(e) => handleInputChange('stopLossRequired', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm font-medium text-white">Stop-Loss Required</span>
              </label>
            </div>
          </div>
        </section>

        {/* Prop Firm Mode */}
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <button
            type="button"
            onClick={() => setPropFirmOpen(!propFirmOpen)}
            className="mb-6 flex w-full items-center justify-between text-lg font-semibold text-white hover:text-blue-400"
          >
            <span>Prop Firm Mode</span>
            {propFirmOpen ? <ChevronUp /> : <ChevronDown />}
          </button>

          {propFirmOpen && (
            <div className="space-y-6 border-t border-slate-800 pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.propFirmMode || false}
                  onChange={(e) => handleInputChange('propFirmMode', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600"
                />
                <span className="text-sm font-medium text-white">Enable Prop Firm Mode</span>
              </label>

              {formData.propFirmMode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white">Select Template</label>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      {Object.keys(PROP_FIRM_TEMPLATES).map((template) => (
                        <button
                          key={template}
                          type="button"
                          onClick={() => handlePropFirmTemplate(template as 'FTMO' | 'MyForexFunds' | 'TheFundedTrader')}
                          className={cn(
                            'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                            formData.propFirmTemplate === template
                              ? 'border-blue-600 bg-blue-900/30 text-blue-300'
                              : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                          )}
                        >
                          {template}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleInputChange('propFirmTemplate', 'Custom')}
                        className={cn(
                          'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                          formData.propFirmTemplate === 'Custom'
                            ? 'border-blue-600 bg-blue-900/30 text-blue-300'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                        )}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {formData.propFirmTemplate && (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-white">Daily Drawdown (%)</label>
                        <input
                          type="number"
                          value={formData.propFirmDailyDrawdown || 0}
                          onChange={(e) => handleInputChange('propFirmDailyDrawdown', parseFloat(e.target.value))}
                          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white">Max Drawdown (%)</label>
                        <input
                          type="number"
                          value={formData.propFirmMaxDrawdown || 0}
                          onChange={(e) => handleInputChange('propFirmMaxDrawdown', parseFloat(e.target.value))}
                          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white">Profit Target (%)</label>
                        <input
                          type="number"
                          value={formData.propFirmProfitTarget || 0}
                          onChange={(e) => handleInputChange('propFirmProfitTarget', parseFloat(e.target.value))}
                          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-800"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Trading Plan'}
          </button>
        </div>
      </form>
    </div>
  )
}
