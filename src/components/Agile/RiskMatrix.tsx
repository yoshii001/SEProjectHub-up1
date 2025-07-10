import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Eye } from 'lucide-react';
import { Risk } from '../../types/agile';

interface RiskMatrixProps {
  risks: Risk[];
  onRiskClick: (risk: Risk) => void;
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks, onRiskClick }) => {
  const matrixSize = 5;
  
  const getRiskColor = (probability: number, impact: number) => {
    const score = probability * impact;
    if (score >= 20) return 'bg-red-500 text-white';
    if (score >= 15) return 'bg-red-400 text-white';
    if (score >= 10) return 'bg-orange-400 text-white';
    if (score >= 6) return 'bg-yellow-400 text-black';
    return 'bg-green-400 text-black';
  };

  const getRiskLevel = (probability: number, impact: number) => {
    const score = probability * impact;
    if (score >= 20) return 'Critical';
    if (score >= 15) return 'High';
    if (score >= 10) return 'Medium';
    if (score >= 6) return 'Low';
    return 'Very Low';
  };

  const getRisksForCell = (probability: number, impact: number) => {
    return risks.filter(risk => risk.probability === probability && risk.impact === impact);
  };

  const impactLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const probabilityLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Risk Matrix (5x5)</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-muted">Very Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-muted">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span className="text-muted">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-muted">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-muted">Critical</span>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="bg-surface rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-6 gap-0">
          {/* Empty top-left corner */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 border-r border-b border-gray-200 dark:border-gray-700"></div>
          
          {/* Impact headers */}
          {impactLabels.map((label, index) => (
            <div
              key={`impact-${index}`}
              className="bg-gray-100 dark:bg-gray-800 p-4 border-r border-b border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="text-xs font-medium text-muted mb-1">Impact</div>
              <div className="text-sm font-semibold text-primary">{label}</div>
              <div className="text-xs text-muted">({index + 1})</div>
            </div>
          ))}

          {/* Matrix cells */}
          {Array.from({ length: matrixSize }, (_, probIndex) => {
            const probability = matrixSize - probIndex; // Reverse order for visual layout
            
            return (
              <React.Fragment key={`row-${probability}`}>
                {/* Probability label */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 border-r border-b border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-muted mb-1">Probability</div>
                  <div className="text-sm font-semibold text-primary text-center">
                    {probabilityLabels[probability - 1]}
                  </div>
                  <div className="text-xs text-muted">({probability})</div>
                </div>

                {/* Risk cells */}
                {Array.from({ length: matrixSize }, (_, impactIndex) => {
                  const impact = impactIndex + 1;
                  const cellRisks = getRisksForCell(probability, impact);
                  const riskLevel = getRiskLevel(probability, impact);
                  const colorClass = getRiskColor(probability, impact);

                  return (
                    <motion.div
                      key={`cell-${probability}-${impact}`}
                      className={`relative p-2 border-r border-b border-gray-200 dark:border-gray-700 min-h-[100px] ${colorClass} hover:opacity-80 transition-opacity`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="text-xs font-medium mb-2 opacity-75">
                        {riskLevel}
                      </div>
                      
                      <div className="space-y-1">
                        {cellRisks.slice(0, 3).map((risk) => (
                          <motion.button
                            key={risk.id}
                            onClick={() => onRiskClick(risk)}
                            className="w-full text-left p-2 bg-black bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="truncate font-medium">{risk.name}</span>
                            </div>
                            <div className="text-xs opacity-75 mt-1">
                              {risk.category}
                            </div>
                          </motion.button>
                        ))}
                        
                        {cellRisks.length > 3 && (
                          <div className="text-xs opacity-75 text-center">
                            +{cellRisks.length - 3} more
                          </div>
                        )}
                        
                        {cellRisks.length === 0 && (
                          <div className="text-xs opacity-50 text-center py-4">
                            No risks
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-800 dark:text-red-200">High Risk</h4>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {risks.filter(r => r.riskScore >= 15).length}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            Require immediate attention
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Medium Risk</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {risks.filter(r => r.riskScore >= 6 && r.riskScore < 15).length}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Monitor closely
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800 dark:text-green-200">Low Risk</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {risks.filter(r => r.riskScore < 6).length}
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            Acceptable level
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix;