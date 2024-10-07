"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Send, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import avsdf from "cytoscape-avsdf";
import { createAutomaton, AutomatonType, Automaton } from "@/backend";
import { RecognitionResult } from "@/backend/utils";
import TransitionTable from "@/components/ownui/TransitionsTable";
import StateTable from "@/components/ownui/StatesTable";
import EqualTable from "@/components/ownui/EqualsTable";

cytoscape.use(avsdf);

const cts_layout = {
  name: "avsdf",
  animate: false,
  fits: true,
  padding: 20,
};

const cts_styles = [
  {
    selector: "node",
    style: {
      "background-color": "#fff",
      "border-color": "#000",
      "border-width": 1,
      label: "data(id)",
      "text-valign": "center",
      "text-halign": "center",
      width: 20,
      height: 20,
      "font-size": "8px",
    },
  },
  {
    selector: "node.accept",
    style: {
      "border-width": 1,
      "background-color": "#A8D5BA",
      "border-color": "#000",
    },
  },
  {
    selector: "node.start",
    style: {
      "border-width": 1,
      "background-color": "#EAB8E4",
      "border-color": "#000",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1,
      "line-color": "#000",
      "target-arrow-color": "#000",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      label: "data(label)",
      "text-rotation": "autorotate",
      "text-margin-y": -5,
      "font-size": "6px",
      "arrow-scale": 0.8,
    },
  },
];

export default function Component() {
  const [expression, setExpression] = useState("");
  const [automata, setAutomata] = useState<Automaton | null>(null);
  const [testString, setTestString] = useState("");
  const [testResult, setTestResult] = useState<RecognitionResult | null>(null);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  const cyRef = useRef(null);

  useEffect(() => {
    if (cyRef.current && automata) {
      const cy = cyRef.current;
      cy.elements().remove();
      cy.add(automata.cytoscape_data);
      cy.layout(cts_layout).run();
      cy.fit();
    }
  }, [automata]);

  const handleButtonClick = (buttonType: string) => {
    setSelectedButton(buttonType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!selectedButton) return;

      const automaton: Automaton = createAutomaton(
        selectedButton as AutomatonType,
        expression
      );
      setAutomata(automaton);
    } catch (err: Error) {
      console.log(err);
    }
  };

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!automata || !testString) return;

      if (!automata.recognize_string) return;

      const result: RecognitionResult = automata.recognize_string(testString);

      setTestResult(result);
      console.log(result.route);
    } catch (err: Error) {
      console.log(err);
    }
  };

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

          <div className="mt-6 flex space-x-4">
            <Button
              className={`bg-blue-500 hover:bg-blue-600 text-white ${
                selectedButton === "NFA" ? "ring-4 ring-blue-300" : ""
              }`}
              onClick={() => handleButtonClick("nfa")}
            >
              NFA
            </Button>

            <Button
              className={`bg-green-500 hover:bg-green-600 text-white ${
                selectedButton === "DFA" ? "ring-4 ring-green-300" : ""
              }`}
              onClick={() => handleButtonClick("dfa")}
            >
              DFA
            </Button>

            <Button
              className={`bg-red-500 hover:bg-red-600 text-white ${
                selectedButton === "oDFA" ? "ring-4 ring-red-300" : ""
              }`}
              onClick={() => handleButtonClick("odfa")}
            >
              oDFA
            </Button>
          </div>

          {automata && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ChevronRight className="mr-2" />
                Simbolos
              </h3>
              <p>{Array.from(automata.symbols).join(", ")}</p>
            </div>
          )}

          {automata && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ChevronRight className="mr-2" />
                Tabla de transiciones
              </h3>
              <TransitionTable transitions={automata.transitions} />
            </div>
          )}

          {automata && automata.states && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ChevronRight className="mr-2" />
                Tabla de estados
              </h3>
              <StateTable states={automata.states} type={automata.type} />
            </div>
          )}

          {automata && automata.equals && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ChevronRight className="mr-2" />
                Tabla de identicos
              </h3>
              <EqualTable equalSet={automata.equals} />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            {automata && (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <ChevronRight className="mr-2" />
                  Grafo
                </h3>
                <div className="p-5 m-5 w-full h-[400px]">
                  <CytoscapeComponent
                    cy={(cy) => (cyRef.current = cy)}
                    elements={CytoscapeComponent.normalizeElements(
                      automata.cytoscape_data
                    )}
                    style={{ width: "100%", height: "100%" }}
                    layout={cts_layout}
                    stylesheet={cts_styles}
                    wheelSensitivity={0.1}
                  />
                  <p className="text-sm">
                    <span className="font-bold">Nota: </span>El nodo en rosa es
                    el estado inicial y los verdes son de aceptacion.
                  </p>
                </div>
              </>
            )}
          </motion.div>

          <form onSubmit={handleTest} className="flex items-center mb-6">
            <Input
              type="text"
              placeholder="Ingrese un string"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="w-[790px] pl-4 pr-12 py-3 bg-gray-50 text-gray-800 placeholder-gray-400 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
            <Button
              type="submit"
              className="ml-2 bg-gray-200 hover:bg-gray-300 text-black"
            >
              Probar
            </Button>
            <div
              className={`ml-4 w-4 h-4 rounded-full ${
                testResult?.recognized ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </form>
          <div className="w-full m-1">
            <p>
              <span className="font-bold">Ruta: </span>
              {testResult?.route.join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
