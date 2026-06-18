"use client";

import React, { memo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeProps,
  type Node,
  type Edge,
} from "reactflow";
import "reactflow/dist/style.css";

interface TableColumn {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
  nullable?: boolean;
}

interface TableNodeData {
  label: string;
  columns: TableColumn[];
  color: string;
}

// React.memo required by CLAUDE.md — prevents re-render thrashing
const TableNode = memo(function TableNode({ data }: NodeProps<TableNodeData>) {
  return (
    <div className="rounded-lg border-2 shadow-sm bg-white min-w-[200px]" style={{ borderColor: data.color }}>
      <div className="px-3 py-1.5 rounded-t-md text-xs font-bold text-white" style={{ backgroundColor: data.color }}>
        {data.label}
      </div>
      <div className="divide-y divide-gray-100">
        {data.columns.map((col) => (
          <div key={col.name} className="flex items-center justify-between px-3 py-1 gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-700">
              {col.pk && <span title="Primary key" className="text-amber-500 font-bold">🔑</span>}
              {col.fk && <span title="Foreign key" className="text-blue-400">🔗</span>}
              {col.name}
            </span>
            <span className="text-xs text-gray-400 font-mono">{col.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const nodeTypes = { table: TableNode };

// 13-table schema from 001_create_schema.sql
const NODES: Node<TableNodeData>[] = [
  {
    id: "clients", type: "table", position: { x: 400, y: 20 },
    data: { label: "clients", color: "#16a34a", columns: [
      { name: "client_id", type: "SERIAL", pk: true },
      { name: "first_name", type: "VARCHAR(60)" },
      { name: "last_name", type: "VARCHAR(60)" },
      { name: "date_of_birth", type: "DATE", nullable: true },
      { name: "primary_funder", type: "VARCHAR(30)", nullable: true },
      { name: "referral_source_id", type: "INT", fk: true, nullable: true },
      { name: "intake_date", type: "DATE" },
    ]},
  },
  {
    id: "clinicians", type: "table", position: { x: 820, y: 20 },
    data: { label: "clinicians", color: "#16a34a", columns: [
      { name: "clinician_id", type: "SERIAL", pk: true },
      { name: "first_name", type: "VARCHAR(60)" },
      { name: "last_name", type: "VARCHAR(60)" },
      { name: "designation", type: "VARCHAR(10)" },
      { name: "wsib_provider_id", type: "VARCHAR(20)", nullable: true },
      { name: "region", type: "VARCHAR(50)", nullable: true },
    ]},
  },
  {
    id: "wsib_claims", type: "table", position: { x: 400, y: 260 },
    data: { label: "wsib_claims", color: "#2563eb", columns: [
      { name: "claim_id", type: "SERIAL", pk: true },
      { name: "client_id", type: "INT", fk: true },
      { name: "insurer_id", type: "INT", fk: true },
      { name: "claim_number", type: "VARCHAR(20)", nullable: true },
      { name: "date_of_incident", type: "DATE" },
      { name: "injury_type", type: "VARCHAR(60)", nullable: true },
      { name: "status", type: "VARCHAR(20)" },
    ]},
  },
  {
    id: "insurers", type: "table", position: { x: 20, y: 260 },
    data: { label: "insurers", color: "#7c3aed", columns: [
      { name: "insurer_id", type: "SERIAL", pk: true },
      { name: "name", type: "VARCHAR(120)" },
      { name: "type", type: "VARCHAR(30)" },
      { name: "billing_portal", type: "VARCHAR(200)", nullable: true },
    ]},
  },
  {
    id: "referral_sources", type: "table", position: { x: 20, y: 20 },
    data: { label: "referral_sources", color: "#7c3aed", columns: [
      { name: "referral_source_id", type: "SERIAL", pk: true },
      { name: "name", type: "VARCHAR(120)" },
      { name: "type", type: "VARCHAR(40)" },
    ]},
  },
  {
    id: "appointments", type: "table", position: { x: 820, y: 260 },
    data: { label: "appointments", color: "#2563eb", columns: [
      { name: "appointment_id", type: "SERIAL", pk: true },
      { name: "client_id", type: "INT", fk: true },
      { name: "clinician_id", type: "INT", fk: true },
      { name: "facility_id", type: "INT", fk: true },
      { name: "claim_id", type: "INT", fk: true, nullable: true },
      { name: "scheduled_at", type: "TIMESTAMPTZ" },
      { name: "visit_type", type: "VARCHAR(20)" },
      { name: "status", type: "VARCHAR(20)" },
    ]},
  },
  {
    id: "facilities", type: "table", position: { x: 1240, y: 20 },
    data: { label: "facilities", color: "#7c3aed", columns: [
      { name: "facility_id", type: "SERIAL", pk: true },
      { name: "name", type: "VARCHAR(120)" },
      { name: "type", type: "VARCHAR(30)" },
      { name: "region", type: "VARCHAR(50)", nullable: true },
    ]},
  },
  {
    id: "treatment_plans", type: "table", position: { x: 400, y: 500 },
    data: { label: "treatment_plans", color: "#2563eb", columns: [
      { name: "plan_id", type: "SERIAL", pk: true },
      { name: "claim_id", type: "INT", fk: true },
      { name: "clinician_id", type: "INT", fk: true },
      { name: "goals", type: "TEXT" },
      { name: "frequency", type: "VARCHAR(60)", nullable: true },
      { name: "status", type: "VARCHAR(20)" },
    ]},
  },
  {
    id: "clinical_notes", type: "table", position: { x: 820, y: 500 },
    data: { label: "clinical_notes", color: "#0891b2", columns: [
      { name: "note_id", type: "SERIAL", pk: true },
      { name: "appointment_id", type: "INT", fk: true },
      { name: "clinician_id", type: "INT", fk: true },
      { name: "soap_subjective", type: "TEXT", nullable: true },
      { name: "ai_structured", type: "BOOLEAN" },
      { name: "signed_at", type: "TIMESTAMPTZ", nullable: true },
    ]},
  },
  {
    id: "progress_reports", type: "table", position: { x: 400, y: 740 },
    data: { label: "progress_reports", color: "#0891b2", columns: [
      { name: "report_id", type: "SERIAL", pk: true },
      { name: "claim_id", type: "INT", fk: true },
      { name: "clinician_id", type: "INT", fk: true },
      { name: "report_type", type: "VARCHAR(20)" },
      { name: "form_data", type: "JSONB" },
      { name: "signed_at", type: "TIMESTAMPTZ", nullable: true },
      { name: "submitted_at", type: "TIMESTAMPTZ", nullable: true },
    ]},
  },
  {
    id: "invoices", type: "table", position: { x: 20, y: 500 },
    data: { label: "invoices", color: "#dc2626", columns: [
      { name: "invoice_id", type: "SERIAL", pk: true },
      { name: "claim_id", type: "INT", fk: true },
      { name: "insurer_id", type: "INT", fk: true },
      { name: "clinician_id", type: "INT", fk: true },
      { name: "invoice_number", type: "VARCHAR(30)" },
      { name: "total_cad", type: "NUMERIC(10,2)" },
      { name: "status", type: "VARCHAR(20)" },
    ]},
  },
  {
    id: "billing_line_items", type: "table", position: { x: 20, y: 740 },
    data: { label: "billing_line_items", color: "#dc2626", columns: [
      { name: "line_item_id", type: "SERIAL", pk: true },
      { name: "invoice_id", type: "INT", fk: true },
      { name: "service_code", type: "VARCHAR(10)", fk: true },
      { name: "units", type: "SMALLINT" },
      { name: "unit_fee_cad", type: "NUMERIC(8,2)" },
      { name: "line_total_cad", type: "NUMERIC(8,2)" },
    ]},
  },
  {
    id: "service_codes", type: "table", position: { x: 1240, y: 500 },
    data: { label: "service_codes", color: "#7c3aed", columns: [
      { name: "service_code", type: "VARCHAR(10)", pk: true },
      { name: "description", type: "VARCHAR(200)" },
      { name: "fee_cad", type: "NUMERIC(8,2)" },
      { name: "discipline", type: "VARCHAR(30)", nullable: true },
      { name: "form_type", type: "VARCHAR(20)", nullable: true },
    ]},
  },
];

const EDGES: Edge[] = [
  { id: "e1",  source: "clients",          target: "wsib_claims",      animated: false },
  { id: "e2",  source: "insurers",         target: "wsib_claims",      animated: false },
  { id: "e3",  source: "referral_sources", target: "clients",          animated: false },
  { id: "e4",  source: "clients",          target: "appointments",     animated: false },
  { id: "e5",  source: "clinicians",       target: "appointments",     animated: false },
  { id: "e6",  source: "facilities",       target: "appointments",     animated: false },
  { id: "e7",  source: "wsib_claims",      target: "appointments",     animated: false },
  { id: "e8",  source: "wsib_claims",      target: "treatment_plans",  animated: false },
  { id: "e9",  source: "clinicians",       target: "treatment_plans",  animated: false },
  { id: "e10", source: "appointments",     target: "clinical_notes",   animated: false },
  { id: "e11", source: "wsib_claims",      target: "progress_reports", animated: false },
  { id: "e12", source: "wsib_claims",      target: "invoices",         animated: false },
  { id: "e13", source: "insurers",         target: "invoices",         animated: false },
  { id: "e14", source: "clinicians",       target: "invoices",         animated: false },
  { id: "e15", source: "invoices",         target: "billing_line_items", animated: false },
  { id: "e16", source: "service_codes",    target: "billing_line_items", animated: false },
];

export function ERDDiagram() {
  const onInit = useCallback(() => {}, []);

  return (
    <div className="w-full h-[600px] rounded-lg border border-gray-200 overflow-hidden">
      <ReactFlow
        nodes={NODES}
        edges={EDGES}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-right"
      >
        <Background gap={16} color="#f0f0f0" />
        <Controls />
        <MiniMap
          nodeColor={(n: Node<TableNodeData>) => n.data?.color ?? "#ccc"}
          maskColor="rgba(255,255,255,0.7)"
        />
      </ReactFlow>

      <div className="flex gap-4 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600 inline-block" /> Core entities</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Clinical workflow</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-600 inline-block" /> Documentation</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> Billing</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-700 inline-block" /> Reference data</span>
      </div>
    </div>
  );
}
