'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Zap, Users, Send } from 'lucide-react'
import { SlackTab } from '@/components/settings/SlackTab'
import { GroupsTab } from '@/components/settings/GroupsTab'
import { BundlesTab } from '@/components/settings/BundlesTab'

type Tab = 'slack' | 'groups' | 'bundles'

export default function SettingsPage() {
  const { user, profile, authLoading } = useApp()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('slack')
  const [localProfile, setLocalProfile] = useState(profile)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    setLocalProfile(profile)
  }, [profile])

  if (authLoading || !user) return null

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'slack',   label: 'Slack & Profile', icon: <Zap className="w-4 h-4" /> },
    { id: 'groups',  label: 'Client Groups',   icon: <Users className="w-4 h-4" /> },
    { id: 'bundles', label: 'Report Bundles',  icon: <Send className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--s0)', color: 'var(--t1)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--b2)' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/workspace')}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--t3)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--s3)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--t1)' }}>Settings</h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--b2)' }}>
        <div className="max-w-3xl mx-auto px-6 flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderColor: activeTab === tab.id ? 'var(--yellow)' : 'transparent',
                color: activeTab === tab.id ? 'var(--yellow)' : 'var(--t3)',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {activeTab === 'slack' && (
          <SlackTab
            profile={localProfile ?? {}}
            onSaved={() => {/* AppContext will refetch on next nav */}}
          />
        )}
        {activeTab === 'groups' && <GroupsTab />}
        {activeTab === 'bundles' && <BundlesTab />}
      </div>
    </div>
  )
}
