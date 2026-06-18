# WinForms → React Concept Reference

Load this file when working on: `/components/WinFormsDemo/` or the StranglerFig roadmap component.

---

## The Core Paradigm (Why WinForms Is Familiar)

WinForms and React share the same fundamental mental model:
**declarative UI trees + event-driven state changes.**

The difference is syntax and tooling — not thinking.

| Concept | WinForms (VB.NET) | React (TypeScript) |
|---------|------------------|-------------------|
| UI component | `Form` / `UserControl` | Component function |
| Markup/layout | Designer `.Designer.vb` (auto-generated) | JSX |
| State | Private fields on the Form class | `useState` / `useReducer` |
| Event binding | `Handles Button1.Click` / `AddHandler` | `onClick={handler}` |
| Side effects | Constructor, `Form_Load`, `Shown` | `useEffect` |
| Data binding | `DataSource` → `BindingSource` → control | props / React state |
| Grid component | `DataGridView` | `<table>` or data-grid library |
| Tab container | `TabControl` with `TabPage` children | Tab component with conditional render |
| Layout | `Dock`, `Anchor`, `TableLayoutPanel` | Flexbox / CSS Grid |
| Modal/dialog | `Form2.ShowDialog()` | `<Modal>` conditional render |
| MDI pattern | `IsMdiContainer`, `MdiParent`, `MdiChildren` | Router + persistent layout shell |
| Validation | `ErrorProvider`, `Validating` event | Zod / react-hook-form |
| Async ops | `BackgroundWorker` / `Async Task` | `async/await` + `useEffect` |
| Dependency injection | Constructor params / service locator | Context / props |

---

## Key WinForms Controls — Visual Recreation Guide

These are the controls to recreate in `98.css`/`XP.css` for the demo:

### 1. Form (top-level window)
```vb
' VB.NET
Public Class ClientListForm
    Inherits Form
    
    Public Sub New()
        InitializeComponent()
        Me.Text = "Client List — FunctionAbility"
        Me.Size = New Size(1024, 768)
    End Sub
End Class
```
**CSS recreation:** Title bar with icon + title text + min/max/close buttons (XP.css `.title-bar`), inner content area, status bar at bottom.

### 2. DataGridView (the workhorse data control)
```vb
' VB.NET — bind to a DataTable
DataGridView1.DataSource = bindingSource1
DataGridView1.AutoGenerateColumns = True
DataGridView1.ReadOnly = True
DataGridView1.SelectionMode = DataGridViewSelectionMode.FullRowSelect
DataGridView1.AllowUserToAddRows = False
```
**CSS recreation:** A table with:
- Header row: `background: #0a246a; color: white; font-weight: bold`
- Alternating row colors: `#ffffff` / `#f0f4ff`
- Selected row: `background: #316ac5; color: white`
- Monospace font (Courier New or Lucida Console)
- Column resize cursor on header borders
- Scrollbar for overflow
- No border-radius (WinForms grids are flat/rectangular)

### 3. MenuStrip
```vb
' VB.NET
Dim fileMenu As New ToolStripMenuItem("File")
Dim openItem As New ToolStripMenuItem("Open Client")
openItem.ShortcutKeys = Keys.Control Or Keys.O
fileMenu.DropDownItems.Add(openItem)
MenuStrip1.Items.Add(fileMenu)
```
**CSS recreation:** Horizontal bar, `background: #ece9d8` (classic XP), menu items with hover underline highlight, nested dropdowns.

### 4. ToolStrip (toolbar)
Row of flat icon buttons below the menu strip. 16×16 pixel icons, separator lines (`|`). Common in LOB apps for Save / New / Delete / Print.

### 5. StatusStrip (status bar)
Bottom of form. Two panels: left shows context ("Ready" / "Saving…"), right shows record count ("Records: 42") or user/date.

### 6. Panel with Dock
```vb
' Left navigation panel docked to the left edge
Panel1.Dock = DockStyle.Left
Panel1.Width = 200
```
**CSS recreation:** `width: 200px; height: 100%; border-right: 1px solid #aca899; background: #f0ece0`

### 7. BindingNavigator (record navigation)
The "◄ ◄ ► ►" navigation bar above a DataGridView. Shows "Record 3 of 42", has first/prev/next/last buttons.

---

## MDI Shell Architecture

FunctionAbility's system is almost certainly **MDI** (Multiple Document Interface) — a container form that hosts child windows. This was the dominant pattern for LOB Windows apps 2000–2015.

```vb
' VB.NET — MDI Parent
Public Class MainForm
    Inherits Form
    
    Public Sub New()
        InitializeComponent()
        Me.IsMdiContainer = True
        Me.WindowState = FormWindowState.Maximized
    End Sub
    
    Private Sub OpenClientList(sender As Object, e As EventArgs) _
        Handles clientListToolStripMenuItem.Click
        Dim child As New ClientListForm()
        child.MdiParent = Me
        child.WindowState = FormWindowState.Maximized
        child.Show()
    End Sub
End Class
```

**CSS recreation (WinForms Shell component):**
- Container: `background: #7b9bd0` (the classic MDI grey-blue background)
- Child windows float/tile inside the container
- Each child has its own title bar, min/max/close
- The MDI background shows when no child is maximised

---

## Event-Driven Programming — The Core VB.NET Pattern

```vb
' EVERY control raises events. You handle them with Handles or AddHandler.

' Declarative (designer-generated)
Private Sub btnSave_Click(sender As Object, e As EventArgs) Handles btnSave.Click
    ' Save logic here
    SaveClient()
End Sub

' Dynamic (at runtime)
AddHandler DataGridView1.CellDoubleClick, AddressOf OnCellDoubleClick

Private Sub OnCellDoubleClick(sender As Object, e As DataGridViewCellEventArgs)
    Dim clientId As Integer = CInt(DataGridView1.Rows(e.RowIndex).Cells("client_id").Value)
    OpenClientDetail(clientId)
End Sub
```

**React equivalent:**
```typescript
// Declarative
<Button onClick={handleSave}>Save</Button>

// Dynamic (event delegation)
<DataGrid onRowDoubleClick={(row) => openClientDetail(row.clientId)} />
```

---

## VB.NET Syntax Quick Reference (for code snippet components)

```vb
' Variables
Dim clientName As String = "Alex Thornton"
Dim visitCount As Integer = 0
Dim isActive As Boolean = True

' Collections
Dim clients As New List(Of Client)()
Dim clientMap As New Dictionary(Of Integer, Client)()

' Null handling (VB uses Nothing)
If client IsNot Nothing Then
    ProcessClient(client)
End If

' String interpolation
Dim message As String = $"Client {clientName} has {visitCount} visits."

' Error handling
Try
    SaveToDatabase(client)
Catch ex As SqlException
    MessageBox.Show($"Database error: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error)
End Try

' Async
Private Async Function LoadClientsAsync() As Task
    Dim clients = Await repository.GetAllClientsAsync()
    DataGridView1.DataSource = clients
End Function
```

---

## Strangler Fig Pattern — Step-by-Step for WinForms → Blazor

**Goal:** Modernise incrementally. The system keeps running throughout. No big-bang rewrite.

### Step 1 — Deploy YARP Facade (Week 1)
```csharp
// ASP.NET Core + YARP: forward ALL traffic to existing WinForms app
// (exposed via a WinForms app hosting a Kestrel endpoint, or via MSSQL directly)
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// appsettings.json
{
  "ReverseProxy": {
    "Routes": {
      "legacy-catch-all": {
        "ClusterId": "legacy",
        "Match": { "Path": "{**catch-all}" }
      }
    },
    "Clusters": {
      "legacy": { "Destinations": { "legacy/destination1": { "Address": "http://legacy-app:8080/" } } }
    }
  }
}
```
Zero functional change. Users can't tell anything happened.

### Step 2 — Replace First Module (Highest Pain / Lowest Risk)
For FunctionAbility: **clinical notes / SOAP generation** is the first candidate.
```csharp
// Add a new route BEFORE the legacy catch-all
"routes": {
  "new-soap-route": {
    "ClusterId": "new-blazor",
    "Match": { "Path": "/notes/{**remainder}" }
  },
  "legacy-catch-all": { ... }  // Still catches everything else
}
```

### Step 3 — Expand Module by Module
Order by value + risk:
1. `/notes` — AI clinical documentation (highest pain, safe to pilot)
2. `/billing` — invoice generation and WSIB submission
3. `/scheduling` — appointment management
4. `/clients` — client records and case management
5. `/reports` — WSIB reporting and analytics

### Step 4 — Decommission
When YARP routing table has zero legacy routes: remove the legacy system, remove YARP.
Total timeline for a system FunctionAbility's size: 18–36 months, zero downtime.

---

## What Tom (IT Director, SQL Server/VB.NET Background) Wants to Hear

These are the lines that land. Use them verbatim in the app copy:

> "WinForms is a well-understood, data-bound paradigm. DataGridView + BindingSource is the same event-driven model as React state — different syntax, same architecture."

> "The business logic in your VB.NET code is more valuable than the UI framework. I'd learn the billing rules first, then the controls second."

> "I don't believe in rewrites. The Strangler Fig pattern means we modernise one module at a time — the system never stops running, clinicians never lose access, and we reduce risk incrementally."

> "My learning curve from TypeScript to VB.NET/C# is measured in weeks, not months — shared static typing, OOP, and a managed runtime. The .NET Upgrade Assistant handles the mechanical parts."
