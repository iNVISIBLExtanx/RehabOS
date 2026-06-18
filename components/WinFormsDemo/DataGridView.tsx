"use client";

import { useState } from "react";

// Synthetic client data matching seed from 003_seed_demo_data.sql
// CLAUDE.md: no real PHI — all names fictitious
interface ClientRow {
  client_id: number;
  last_name: string;
  first_name: string;
  date_of_birth: string;
  city: string;
  primary_funder: string;
  intake_date: string;
  status: string;
}

const CLIENTS: ClientRow[] = [
  { client_id: 1, last_name: "Thornton",   first_name: "Alex",   date_of_birth: "1985-06-14", city: "Woodbridge",  primary_funder: "WSIB",    intake_date: "2025-09-03", status: "Active" },
  { client_id: 2, last_name: "Santos",     first_name: "Maria",  date_of_birth: "1972-11-28", city: "Mississauga", primary_funder: "Auto",    intake_date: "2025-10-15", status: "Active" },
  { client_id: 3, last_name: "Nkemdirim", first_name: "Robert", date_of_birth: "1990-03-07", city: "North York",  primary_funder: "WSIB",    intake_date: "2025-08-19", status: "Active" },
  { client_id: 4, last_name: "Al-Rashid", first_name: "Fatima", date_of_birth: "1968-09-22", city: "Etobicoke",   primary_funder: "WSIB",    intake_date: "2025-11-01", status: "Under Review" },
  { client_id: 5, last_name: "Kowalczyk", first_name: "David",  date_of_birth: "1979-04-11", city: "Brampton",    primary_funder: "WSIB",    intake_date: "2025-12-10", status: "RTW" },
  { client_id: 6, last_name: "Fernandez", first_name: "Linda",  date_of_birth: "1995-08-30", city: "Toronto",     primary_funder: "Auto",    intake_date: "2026-01-22", status: "Active" },
];

const COLUMNS: { key: keyof ClientRow; label: string; width: string }[] = [
  { key: "client_id",    label: "ID",           width: "w-10" },
  { key: "last_name",    label: "Last Name",    width: "w-28" },
  { key: "first_name",   label: "First Name",   width: "w-24" },
  { key: "date_of_birth",label: "Date of Birth",width: "w-28" },
  { key: "city",         label: "City",         width: "w-28" },
  { key: "primary_funder",label: "Funder",      width: "w-24" },
  { key: "intake_date",  label: "Intake",       width: "w-24" },
  { key: "status",       label: "Status",       width: "w-24" },
];

export function DataGridView() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentRecord, setCurrentRecord] = useState(1);

  function selectRow(id: number, idx: number) {
    setSelectedId(id);
    setCurrentRecord(idx + 1);
  }

  return (
    // XP-era DataGridView recreation from WINFORMS_CONCEPTS.md §"DataGridView"
    <div className="border border-[#7f9db9] overflow-hidden font-mono">
      {/* BindingNavigator — "◄ ◄ ► ►" record navigation bar */}
      <div className="flex items-center gap-1 px-1 py-0.5 bg-[#ece9d8] border-b border-[#aca899]">
        <button onClick={() => { setSelectedId(CLIENTS[0].client_id); setCurrentRecord(1); }}
          className="px-1.5 py-0.5 text-xs bg-[#ece9d8] border border-[#aca899] hover:bg-[#dde9f8] active:bg-[#b8d0e8]">|◄</button>
        <button onClick={() => { const i = Math.max(0, currentRecord - 2); setSelectedId(CLIENTS[i].client_id); setCurrentRecord(i + 1); }}
          className="px-1.5 py-0.5 text-xs bg-[#ece9d8] border border-[#aca899] hover:bg-[#dde9f8] active:bg-[#b8d0e8]">◄</button>
        <span className="text-xs text-gray-700 px-2">
          Record {currentRecord} of {CLIENTS.length}
        </span>
        <button onClick={() => { const i = Math.min(CLIENTS.length - 1, currentRecord); setSelectedId(CLIENTS[i].client_id); setCurrentRecord(i + 1); }}
          className="px-1.5 py-0.5 text-xs bg-[#ece9d8] border border-[#aca899] hover:bg-[#dde9f8] active:bg-[#b8d0e8]">►</button>
        <button onClick={() => { const i = CLIENTS.length - 1; setSelectedId(CLIENTS[i].client_id); setCurrentRecord(i + 1); }}
          className="px-1.5 py-0.5 text-xs bg-[#ece9d8] border border-[#aca899] hover:bg-[#dde9f8] active:bg-[#b8d0e8]">►|</button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          {/* Header row: #0a246a background per WINFORMS_CONCEPTS.md */}
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key}
                  className={`${col.width} px-2 py-1 text-left font-bold text-white bg-[#0a246a] border-r border-[#3a5fa8] whitespace-nowrap`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          {/* Alternating rows: #ffffff / #f0f4ff; selected: #316ac5 */}
          <tbody>
            {CLIENTS.map((row, idx) => {
              const isSelected = row.client_id === selectedId;
              const isEven = idx % 2 === 0;
              return (
                <tr
                  key={row.client_id}
                  onClick={() => selectRow(row.client_id, idx)}
                  className={`cursor-pointer ${isSelected ? "bg-[#316ac5] text-white" : isEven ? "bg-white text-black" : "bg-[#f0f4ff] text-black"}`}
                >
                  {COLUMNS.map((col) => (
                    <td key={col.key} className="px-2 py-1 border-r border-b border-[#d4d0c8] whitespace-nowrap">
                      {String(row[col.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
