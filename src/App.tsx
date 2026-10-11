import { useState } from 'react'
import { BillDetails } from './components/BillDetails'
import { ConfirmDialog } from './components/ConfirmDialog'
import { FriendsPanel } from './components/FriendsPanel'
import { Header } from './components/Header'
import { ItemsPanel } from './components/ItemsPanel'
import { SettlementPanel } from './components/SettlementPanel'
import { ShareBar } from './components/ShareBar'
import { TaxTipPanel } from './components/TaxTipPanel'
import { useBill } from './hooks/useBill'

export default function App() {
  const billState = useBill()
  const [resetOpen, setResetOpen] = useState(false)
  const isEmpty =
    billState.bill.people.length === 0 &&
    billState.bill.items.length === 0 &&
    !billState.bill.title.trim()

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[-8%] h-72 w-72 rounded-full bg-violet-700/25 blur-[120px]" />
        <div className="absolute right-[-5%] top-24 h-80 w-80 rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <Header onReset={() => setResetOpen(true)} />

        <div className="mt-6">
          <ShareBar
            bill={billState.bill}
            settlement={billState.settlement}
            onSample={billState.loadSample}
            isEmpty={isEmpty}
          />
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
          <div className="space-y-6">
            <BillDetails
              title={billState.bill.title}
              currency={billState.bill.currency}
              onTitle={billState.setTitle}
              onCurrency={billState.setCurrency}
            />
            <FriendsPanel
              people={billState.bill.people}
              onAdd={billState.addPerson}
              onRemove={billState.removePerson}
            />
            <ItemsPanel
              items={billState.bill.items}
              people={billState.bill.people}
              currency={billState.bill.currency}
              onAdd={billState.addItem}
              onUpdate={billState.updateItem}
              onRemove={billState.removeItem}
              onToggle={billState.toggleAssignment}
              onAssignAll={billState.assignAll}
            />
            <TaxTipPanel
              tax={billState.bill.tax}
              tip={billState.bill.tip}
              currency={billState.bill.currency}
              taxCents={billState.settlement.taxCents}
              tipCents={billState.settlement.tipCents}
              onChange={billState.setCharge}
            />
          </div>
          <SettlementPanel
            settlement={billState.settlement}
            currency={billState.bill.currency}
          />
        </div>

        <footer className="mt-10 pb-8 text-center text-xs text-violet-200/40">
          SnapSplit stores this bill only in your browser. No accounts, no servers.
        </footer>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Clear this bill?"
        description="This removes every friend, item, tax, and tip from this device. You cannot undo it."
        confirmLabel="Clear everything"
        danger
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          billState.resetBill()
          setResetOpen(false)
        }}
      />
    </div>
  )
}
