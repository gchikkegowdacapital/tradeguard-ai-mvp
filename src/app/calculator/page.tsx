'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Copy, Share2, AlertCircle, TrendingUp } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatNumber } from '@/lib/utils'

const FOREX_PAIRS = {
  'EUR/USD': 1.0800,
  'GBP/USD': 1.2700,
  'USD/JPY': 150.5,
  'AUD/USD': 0.6600,
  'NZD/USD': 0.5950,
  'USD/CAD': 1.3600,
  'USD/CHF': 0.8800,
}

const CRYPTO_INSTRUMENTS = {
  'BTC/USD': 42000,
  'ETH/USD': 2300,
  'XRP/USD': 2.50,
  'DOGE/USD': 0.35,
}

const METAL_INSTRUMENTS = {
  'XAU/USD': 2050,
  'XAG/USD': 25,
}

const STOCK_INDICES = {
  'SPX500': 5000,
  'GER40': 18000,
  'UK100': 7800,
}

type Instrument = keyof typeof FOREX_PAIRS | keyof typeof CRYPTO_INSTRUMENTS | keyof typeof METAL_INSTRUMENTS | keyof typeof STOCK_INDICES

export default function CalculatorPage() {
  const searchParams = useSearchParams()
  const [accountBalance, setAccountBalance] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(1)
  const [entryPrice, setEntryPrice] = useState(1.0800)
  const [stopLoss, setStopLoss] = useState(1.0750)
  const [takeProfit, setTakeProfit] = useState(1.0900)
  const [instrument, setInstrument] = useState<Instrument>('EUR/USD')
  const [accountCurrency, setAccountCurrency] = useState('USD')
  const [copied, setCopied] = useState(false)

  const allInstruments = {
    ...FOREX_PAIRS,
    ...CRYPTO_INSTRUMENTS,
    ...METAL_INSTRUMENTS,
    ...STOCK_INDICES,
  }

  // Calculate pip value based on instrument
  const calculatePipValue = () => {
    if (!instrument) return 0

    const currentPrice = allInstruments[instrument as Instrument] || 1

    if (instrument.includes('JPY')) {
      return 0.01 / currentPrice * 1000
    }

    if (instrument.startsWith('XAU')) {
      return 0.01 * 100
    }

    if (instrument.startsWith('XAG')) {
      return 0.01 * 5000
    }

    if (instrument.startsWith(('BTC', 'ETH', 'XRP', 'DOGE'))) {
      return 1
    }

    return 0.0001 / currentPrice * 100000
  }

  const pipValue = calculatePipValue()

  // Calculate position size
  const positionSizeInPips = Math.abs(entryPrice - stopLoss)

  let positionSize = 0
  let dollarRisk = 0
  let pipValueForCalculation = pipValue

  if (instrument && positionSizeInPips > 0) {
    dollarRisk = (accountBalance * riskPercent) / 100

    if (instrument.startsWith(('BTC', 'ETH', 'XRP', 'DOGE'))) {
      const priceDifference = Math.abs(entryPrice - stopLoss)
      positionSize = dollarRisk / priceDifference
    } else if (instrument.startsWith('XAU') || instrument.startsWith('XAG')) {
      const contractSize = instrument.startsWith('XAU') ? 100 : 5000
      const priceDifference = Math.abs(entryPrice - stopLoss)
      positionSize = (dollarRisk / priceDifference) / contractSize
    } else {
      const priceDifference = Math.abs(entryPrice - stopLoss)
      const pipValueInUSD = pipValue

      if (accountCurrency === 'USD' && instrument.includes('USD')) {
        positionSize = dollarRisk / (priceDifference * 10000 * pipValue)
      } else {
        positionSize = dollarRisk / (priceDifference * 10000 * pipValue)
      }
    }
  }

  // Calculate R:R if TP provided
  const riskAmount = Math.abs(entryPrice - stopLoss)
  const rewardAmount = Math.abs(takeProfit - entryPrice)
  const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0

  // Calculate potential profit
  const potentialProfit = dollarRisk * riskRewardRatio

  // Calculate margin required (assuming 100:1 leverage for forex)
  const leverage = instrument.includes('/') ? 100 : 1
  const marginRequired = (positionSize * entryPrice) / leverage

  // Risk warnings
  const riskLevel =
    riskPercent > 5 ? 'critical' : riskPercent > 2 ? 'warning' : 'safe'

  const handleCopySize = () => {
    const text = positionSize.toFixed(2)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    const params = new URLSearchParams({
      balance: accountBalance.toString(),
      risk: riskPercent.toString(),
      entry: entryPrice.toString(),
      sl: stopLoss.toString(),
      tp: takeProfit.toString(),
      instrument: instrument,
    })
    const shareUrl = `${window.location.origin}/calculator?${params.toString()}`
    navigator.clipboard.writeText(shareUrl)
    alert('Share link copied to clipboard!')
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />

      <section className="py-12 border-b border-slate-800">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Free Position Size Calculator
              </h1>
              <p className="text-xl text-slate-300">
                The most accurate position sizing tool for forex, crypto, commodities, and indices.
                Used by 10,000+ traders worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Inputs */}
              <div className="space-y-6">
                <Card className="border-slate-800 bg-slate-900/50">
                  <CardHeader className="border-slate-800">
                    <CardTitle className="text-white">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Input
                      label="Account Balance"
                      type="number"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(parseFloat(e.target.value))}
                      icon={<span className="text-sm">$</span>}
                      className="bg-slate-800 border-slate-700 text-white"
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Risk per Trade: {riskPercent}%
                      </label>
                      <Slider
                        min={0.1}
                        max={5}
                        step={0.1}
                        value={[riskPercent]}
                        onValueChange={(value) => setRiskPercent(value[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>0.1%</span>
                        <span>5%</span>
                      </div>
                    </div>

                    {riskLevel === 'critical' && (
                      <div className="p-4 rounded-lg bg-danger-900/30 border border-danger-700 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-danger-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-danger-300 text-sm">Risk Too High</p>
                          <p className="text-danger-200 text-xs mt-1">
                            Risking {riskPercent}% per trade is unsustainable. Pros risk 1-2%.
                          </p>
                        </div>
                      </div>
                    )}

                    {riskLevel === 'warning' && (
                      <div className="p-4 rounded-lg bg-warning-900/30 border border-warning-700 flex gap-3">
                        <AlertCircle className="h-5 w-5 text-warning-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-warning-300 text-sm">High Risk</p>
                          <p className="text-warning-200 text-xs mt-1">
                            Risking {riskPercent}% per trade. Consider reducing to 1-2%.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50">
                  <CardHeader className="border-slate-800">
                    <CardTitle className="text-white">Trade Setup</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Instrument
                      </label>
                      <Select value={instrument} onValueChange={(value) => setInstrument(value as Instrument)}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <div className="text-xs px-2 py-1.5 text-slate-400 font-semibold">Forex</div>
                          {Object.keys(FOREX_PAIRS).map((pair) => (
                            <SelectItem key={pair} value={pair}>
                              {pair}
                            </SelectItem>
                          ))}
                          <div className="text-xs px-2 py-1.5 text-slate-400 font-semibold">Crypto</div>
                          {Object.keys(CRYPTO_INSTRUMENTS).map((crypto) => (
                            <SelectItem key={crypto} value={crypto}>
                              {crypto}
                            </SelectItem>
                          ))}
                          <div className="text-xs px-2 py-1.5 text-slate-400 font-semibold">Metals</div>
                          {Object.keys(METAL_INSTRUMENTS).map((metal) => (
                            <SelectItem key={metal} value={metal}>
                              {metal}
                            </SelectItem>
                          ))}
                          <div className="text-xs px-2 py-1.5 text-slate-400 font-semibold">Indices</div>
                          {Object.keys(STOCK_INDICES).map((index) => (
                            <SelectItem key={index} value={index}>
                              {index}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Input
                      label="Entry Price"
                      type="number"
                      step={0.0001}
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(parseFloat(e.target.value))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />

                    <Input
                      label="Stop Loss Price"
                      type="number"
                      step={0.0001}
                      value={stopLoss}
                      onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />

                    <Input
                      label="Take Profit Price (optional)"
                      type="number"
                      step={0.0001}
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                      className="bg-slate-800 border-slate-700 text-white"
                    />

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Account Currency
                      </label>
                      <Select value={accountCurrency} onValueChange={setAccountCurrency}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR'].map((cur) => (
                            <SelectItem key={cur} value={cur}>
                              {cur}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="space-y-6">
                <Card className="border-primary-500/50 bg-gradient-to-br from-primary-900/30 to-slate-900/50">
                  <CardHeader className="border-primary-500/30">
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary-400" />
                      Position Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-primary-400 mb-2">
                      {positionSize.toFixed(2)}
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                      {instrument && instrument.includes('/')
                        ? 'lots'
                        : 'units'}
                    </p>
                    <Button
                      onClick={handleCopySize}
                      className="w-full gap-2"
                      variant={copied ? 'success' : 'default'}
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copied!' : 'Copy Position Size'}
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="pt-6">
                      <p className="text-xs text-slate-400 mb-1">Dollar Risk</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(dollarRisk)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-800 bg-slate-900/50">
                    <CardContent className="pt-6">
                      <p className="text-xs text-slate-400 mb-1">Risk / Account</p>
                      <p className="text-2xl font-bold text-white">
                        {riskPercent.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>

                  {takeProfit && takeProfit !== entryPrice && (
                    <>
                      <Card className="border-slate-800 bg-slate-900/50">
                        <CardContent className="pt-6">
                          <p className="text-xs text-slate-400 mb-1">Risk/Reward Ratio</p>
                          <p className="text-2xl font-bold text-white">
                            1:{riskRewardRatio.toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-800 bg-slate-900/50">
                        <CardContent className="pt-6">
                          <p className="text-xs text-slate-400 mb-1">Potential Profit</p>
                          <p className="text-2xl font-bold text-success-400">
                            {formatCurrency(potentialProfit)}
                          </p>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                <Card className="border-slate-800 bg-slate-900/50">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Pip Value</span>
                      <span className="text-white font-semibold">
                        {pipValue.toFixed(4)} {accountCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Margin Required (100:1)</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(marginRequired)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleShare} variant="outline" className="w-full gap-2">
                  <Share2 className="h-4 w-4" />
                  Share This Calculation
                </Button>

                <div className="p-6 rounded-lg bg-primary-900/30 border border-primary-700/50">
                  <h3 className="font-semibold text-white mb-3">Want This Automated?</h3>
                  <p className="text-slate-300 text-sm mb-4">
                    TradeGuard AI automatically enforces these position sizes on every trade.
                    Never over-risk again.
                  </p>
                  <Link href="/auth/signup">
                    <Button className="w-full">Connect Your Broker</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
