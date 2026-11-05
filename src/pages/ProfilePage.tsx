import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { useSignOut } from '@/hooks/useAuth'
import { getCities } from '@/api/cities'
import { setFavouriteCity } from '@/api/user'
import { getErrorMessage } from '@/api/errors'
import CityPicker from '@/components/ui/CityPicker'
import { motion } from 'framer-motion'
import { Send, Mail, LogOut, ChevronRight, Star } from 'lucide-react'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const navigate = useNavigate()
  const signOut = useSignOut()

  const [savingCity, setSavingCity] = useState(false)
  const [cityError, setCityError] = useState('')
  const [citySaved, setCitySaved] = useState(false)

  const { data: cities = [] } = useQuery({ queryKey: ['cities'], queryFn: getCities })

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const favouriteSlug = user?.favourite_city?.slug ?? ''

  const handleFavouriteCityChange = async (slug: string | null) => {
    setSavingCity(true)
    setCityError('')
    setCitySaved(false)
    try {
      await setFavouriteCity(slug)
      await refreshUser()
      setCitySaved(true)
    } catch (err) {
      setCityError(getErrorMessage(err, "We couldn't save your favourite city. Please try again."))
    } finally {
      setSavingCity(false)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? '?').toUpperCase()

  const telegramConnected = Boolean(user?.telegram?.connected)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ padding: '20px 0', maxWidth: 560, margin: '0 auto' }}>
      <h1 className="sr-only">Your profile</h1>
      <div style={{
        display: 'flex', gap: 20, alignItems: 'center',
        marginBottom: 32, paddingBottom: 28,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {user?.image_url ? (
          <img
            src={user.image_url}
            alt=""
            referrerPolicy="no-referrer"
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div aria-hidden="true" style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--bg3)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text)',
          }}>
            {initials}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4, letterSpacing: 0, overflowWrap: 'anywhere' }}>{user?.name ?? 'Your account'}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', overflowWrap: 'anywhere' }}>{user?.email}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div aria-hidden="true" style={{ color: 'var(--text3)' }}><Star size={18} /></div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Favourite city</h2>
            <div id="favourite-city-hint" style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
              We'll pick it for you when you create an alert
            </div>
          </div>
        </div>

        <CityPicker
          label="Favourite city"
          describedBy="favourite-city-hint"
          cities={cities}
          value={favouriteSlug}
          disabled={savingCity}
          onChange={handleFavouriteCityChange}
        />

        <div aria-live="polite" style={{ minHeight: 18 }}>
          {cityError && (
            <div role="alert" style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>{cityError}</div>
          )}
          {citySaved && !cityError && (
            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>Saved</div>
          )}
        </div>
      </div>

      <ul style={{ background: 'var(--bg2)', borderRadius: 8, overflow: 'hidden', marginBottom: 16, listStyle: 'none' }}>
        <li style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <button type="button" className="profile-row" onClick={() => navigate('/telegram')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span aria-hidden="true" style={{ color: 'var(--text3)' }}><Send size={18} /></span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Telegram alerts</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: telegramConnected ? 'var(--accent)' : 'var(--text3)', fontWeight: 600 }}>
                {telegramConnected ? 'Connected' : 'Not connected'}
              </span>
              <ChevronRight size={16} color="var(--text3)" aria-hidden="true" />
            </span>
          </button>
        </li>
        <li className="profile-row" style={{ cursor: 'default' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span aria-hidden="true" style={{ color: 'var(--text3)' }}><Mail size={18} /></span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Email alerts</span>
          </span>
          <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>Always on</span>
        </li>
      </ul>

      <div style={{ background: 'var(--bg2)', borderRadius: 8, overflow: 'hidden' }}>
        <button type="button" className="profile-row profile-row-danger" onClick={signOut}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span aria-hidden="true" style={{ color: 'var(--red)' }}><LogOut size={18} /></span>
            <span style={{ fontSize: 14, color: 'var(--red)', fontWeight: 600 }}>Sign out</span>
          </span>
        </button>
      </div>


      <style>{`
        .profile-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          width: 100%; min-height: 56px; padding: 16px 20px;
          background: transparent; border: none; color: var(--text); text-align: left;
          cursor: pointer; transition: background-color 0.15s;
        }
        @media (hover: hover) {
          button.profile-row:hover { background: var(--bg3); }
          button.profile-row-danger:hover { background: rgba(243,114,127,0.06); }
        }
      `}</style>
    </motion.div>
  )
}
