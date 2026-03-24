import { BookOpenText } from 'lucide-react'
import AddIcon from '@mui/icons-material/Add'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import { AppBar, Box, Button, Chip, Container, Toolbar, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useUser } from './context/UserContext'
import { CreateStoryPage } from './pages/CreateStoryPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { ListeStoriesPage } from './pages/ListeStoriesPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import logo from './assets/logo.png';
import { StoryDetailPage } from './pages/StoryDetailPage'
import { UserDashboardPage } from './pages/UserDashboardPage'
import { ReviewerDashboardPage } from './pages/ReviewerDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import type { UserRole } from './types'

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useUser()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

function GuestOnlyRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useUser()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function RoleRoute({ children, allowedRoles }: { children: ReactElement; allowedRoles: UserRole[] }) {
  const { isAuthenticated, user } = useUser()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function DashboardRedirect() {
  const { user } = useUser()

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />
  }

  if (user.role === 'REVIEWER') {
    return <Navigate to="/dashboard/reviewer" replace />
  }

  return <Navigate to="/dashboard/user" replace />
}

function App() {
  const { isAuthenticated, user, logout } = useUser()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 1.25,
              py: { xs: 1, sm: 0.75 },
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
            }}
          >


            <Button
              component={Link}
              to="/"
              color="inherit"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
                gap: 1.2,
                px: 1,

                minHeight: { xs: 42, md: 36 },
              }}
            >
              <img
                src={logo}
                alt="Storyn'Go"
                style={{
                  height: 45,
                  width: 'auto',
                  display: 'block'
                }}
              />
            </Button>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-end' },
                gap: 1,
                width: { xs: '100%', md: 'auto' },
              }}
            >
              {isAuthenticated ? (
                <>
                  
                  <Button
                    component={Link}
                    to="/les-histoires"
                    variant="outlined"
                  >
                    Les Histoires
                  </Button>
                  {(user?.role === 'ADMIN' || user?.role === 'REVIEWER') && (
                    <Button
                      component={Link}
                      to={user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/reviewer'}
                      variant="outlined"
                      startIcon={<DashboardCustomizeIcon />}
                      size="small"
                      sx={{ minWidth: { xs: 'calc(50% - 4px)', md: 0 } }}
                    >
                      Tableau de bord
                    </Button>
                  )}
                  <Button
                    component={Link}
                    to="/leaderboard"
                    variant="outlined"
                    startIcon={<EmojiEventsIcon />}
                    size="small"
                    sx={{ minWidth: { xs: 'calc(50% - 4px)', md: 0 } }}
                  >
                    Classement
                  </Button>
                  <Button
                    component={Link}
                    to="/me/favoris"
                    variant="outlined"
                    startIcon={<BookmarkBorderIcon />}
                    size="small"
                    sx={{ minWidth: { xs: 'calc(50% - 4px)', md: 0 } }}
                  >
                    Mes Favoris
                  </Button>
                  <Button
                    component={Link}
                    to="/dashboard/user"
                    variant="outlined"
                    startIcon={<AccountCircleIcon />}
                    size="small"
                    sx={{ minWidth: { xs: 'calc(50% - 4px)', md: 0 } }}
                  >
                    {`${user?.pseudo}` }
                  </Button>
                  <Button
                    component={Link}
                    to="/stories/create"
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ minWidth: { xs: 'calc(50% - 4px)', md: 0 } }}
                  >
                    Creer
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={logout}
                    startIcon={<LogoutIcon />}
                    size="small"
                    sx={{ minWidth: { xs: 'calc(50% - 4px)', md: 0 } }}
                  >
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/les-histoires"
                    variant="outlined"
                  >
                    Les Histoires
                  </Button>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    color="secondary"
                    startIcon={<LoginIcon />}
                    size="small"
                    sx={{ minWidth: { xs: 'calc(50% - 4px)', md: 0 } }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddAlt1Icon />}
                    size="small"
                    sx={{ minWidth: { xs: 'calc(50% - 4px)', md: 0 } }}
                  >
                    S'inscrire
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
            <Route path="/les-histoires" element={<ListeStoriesPage />} />

            <Route
              path="/dashboard/user"
              element={
                <RoleRoute allowedRoles={['USER', 'REVIEWER', 'ADMIN']}>
                  <UserDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/reviewer"
              element={
                <RoleRoute allowedRoles={['REVIEWER', 'ADMIN']}>
                  <ReviewerDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </RoleRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stories/create"
              element={
                <ProtectedRoute>
                  <CreateStoryPage />
                </ProtectedRoute>
              }
            />
            <Route path="/stories/:id" element={<StoryDetailPage />} />
            <Route
              path="/me/favoris"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnlyRoute>
                  <RegisterPage />
                </GuestOnlyRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Container>
    </Box>
  )
}

export default App
