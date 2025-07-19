"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Edit3, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';

interface BudgetTemplate {
  id?: string;
  name: string;
  incomes: { source: string; amount: number }[];
  expenses: { category: string; amount: number }[];
  frequency: 'monthly' | 'weekly' | 'random';
  notes?: string;
}

interface BudgetTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetTemplate | null;
  onEdit: (budget: BudgetTemplate) => void;
}

const BudgetTemplateModal: React.FC<BudgetTemplateModalProps> = ({
  isOpen,
  onClose,
  budget,
  onEdit,
}) => {
  if (!budget) return null;

  const totalIncome = budget.incomes.reduce((sum: number, i: { source: string; amount: number }) => sum + (Number(i.amount) || 0), 0);
  const totalExpenses = budget.expenses.reduce((sum: number, e: { category: string; amount: number }) => sum + (Number(e.amount) || 0), 0);
  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Set up fonts and colors
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    
    // Title
    doc.text(budget.name, 20, 30);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Budget Template - ${budget.frequency}`, 20, 40);
    
    // Income Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Income Sources', 20, 60);
    
    doc.setFontSize(10);
    let yPosition = 75;
    
    budget.incomes.forEach((income: { source: string; amount: number }) => {
      const sourceText = income.source || 'Unnamed Source';
      const amountText = formatCurrency(income.amount);
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(sourceText, 20, yPosition);
      doc.setTextColor(0, 100, 0);
      doc.text(amountText, 150, yPosition);
      yPosition += 8;
    });
    
    // Total Income
    yPosition += 5;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition - 2, 190, yPosition - 2);
    doc.text('Total Income:', 20, yPosition);
    doc.setTextColor(0, 100, 0);
    doc.text(formatCurrency(totalIncome), 150, yPosition);
    
    // Expenses Section
    yPosition += 20;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Expenses', 20, yPosition);
    
    doc.setFontSize(10);
    yPosition += 15;
    
    budget.expenses.forEach((expense: { category: string; amount: number }) => {
      const categoryText = expense.category || 'Unnamed Category';
      const amountText = formatCurrency(expense.amount);
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(categoryText, 20, yPosition);
      doc.setTextColor(150, 0, 0);
      doc.text(amountText, 150, yPosition);
      yPosition += 8;
    });
    
    // Total Expenses
    yPosition += 5;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition - 2, 190, yPosition - 2);
    doc.text('Total Expenses:', 20, yPosition);
    doc.setTextColor(150, 0, 0);
    doc.text(formatCurrency(totalExpenses), 150, yPosition);
    
    // Net Balance
    yPosition += 20;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Net Balance:', 20, yPosition);
    doc.setTextColor(balance >= 0 ? 0 : 150, balance >= 0 ? 100 : 0, 0);
    doc.text(formatCurrency(balance), 150, yPosition);
    
    // Warning if over budget
    if (balance < 0) {
      yPosition += 10;
      doc.setFontSize(10);
      doc.setTextColor(150, 0, 0);
      doc.text('Warning: Expenses exceed income', 20, yPosition);
    }
    
    // Notes section
    if (budget.notes) {
      yPosition += 20;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Notes:', 20, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      
      // Split notes into lines that fit the page width
      const notesLines = doc.splitTextToSize(budget.notes, 170);
      notesLines.forEach((line: string) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 6;
      });
    }
    
    // Save the PDF
    const fileName = `${budget.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    doc.save(fileName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{budget.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Budget Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Frequency: {budget.frequency}</span>
            <span>•</span>
            <span>{budget.incomes.length} income sources</span>
            <span>•</span>
            <span>{budget.expenses.length} expense categories</span>
          </div>

          {/* Income Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary">Income Sources</h3>
            <div className="space-y-2">
              {budget.incomes.map((income: { source: string; amount: number }, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">{income.source}</span>
                  <span className="text-primary font-semibold">{formatCurrency(income.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 border-t-2 border-primary font-bold text-lg">
                <span>Total Income</span>
                <span className="text-primary">{formatCurrency(totalIncome)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-destructive">Expenses</h3>
            <div className="space-y-2">
              {budget.expenses.map((expense: { category: string; amount: number }, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-medium">{expense.category}</span>
                  <span className="text-destructive font-semibold">{formatCurrency(expense.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 border-t-2 border-destructive font-bold text-lg">
                <span>Total Expenses</span>
                <span className="text-destructive">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Net Balance</span>
              <span className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
              </span>
            </div>
            {balance < 0 && (
              <p className="text-sm text-red-600 mt-1">Warning: Expenses exceed income</p>
            )}
          </div>

          {/* Notes */}
          {budget.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{budget.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={() => onEdit(budget)} className="flex-1">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Budget
            </Button>
            <Button onClick={downloadPDF} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetTemplateModal; 