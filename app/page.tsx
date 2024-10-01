'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Send, Clock, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: Date;
}

export default function Component() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const savedHistory = localStorage.getItem('automataHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para resolver la expresión del autómata finito
    const newResult = `Resultado para: ${expression}`
    setResult(newResult)

    const newHistoryItem = {
      expression,
      result: newResult,
      timestamp: new Date()
    }

    const updatedHistory = [newHistoryItem, ...history].slice(0, 10)
    setHistory(updatedHistory)
    localStorage.setItem('automataHistory', JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('automataHistory')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">
            Solucionador de Autómatas Finitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Ingrese su expresión de autómata finito"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="w-[790px] pl-4 pr-12 py-3 bg-gray-50 text-gray-800 placeholder-gray-400 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 ransform -translate-y-1/2 bg-gray-200 hover:bg-gray-300"
              >
                <Send className="h-4 w-4 text-gray-600" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <ChevronRight className="mr-2" />
              Solución paso a paso
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-auto border border-gray-200">
              {result ? (
                <pre className="text-gray-800 whitespace-pre-wrap">{result}</pre>
              ) : (
                <div className="text-gray-400 text-center pt-20">
                  La solución paso a paso aparecerá aquí...
                </div>
              )}
            </div>
          </motion.div>

          <div className="mt-8">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <Clock className="mr-2 h-4 w-4" />
              {showHistory ? 'Ocultar Historial' : 'Mostrar Historial'}
            </Button>

            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Historial de Expresiones
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearHistory}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Limpiar historial</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      {history.map((item, index) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <p className="text-sm font-medium text-gray-800">
                            {item.expression}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.timestamp.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}