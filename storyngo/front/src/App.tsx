import { BookOpenText } from 'lucide-react'
import AddIcon from '@mui/icons-material/Add'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1'
import { AppBar, Box, Button, Chip, Container, Toolbar, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useUser } from './context/UserContext'
import { CreateStoryPage } from './pages/CreateStoryPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { StoryDetailPage } from './pages/StoryDetailPage'

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

function App() {
  const { isAuthenticated, user, logout } = useUser()

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              component={Link}
              to="/"
              color="inherit"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.2, px: 1 }}
            >
              <BookOpenText size={20} />
              <Typography variant="h6" fontWeight={700}>
                Storyn'Go Platform
              </Typography>
            </Button>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              {isAuthenticated ? (
                <>
                  <Chip label={user?.pseudo} color="primary" variant="outlined" />
                  <Button component={Link} to="/stories/create" variant="contained" startIcon={<AddIcon />}>
                    Creer
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={logout} startIcon={<LogoutIcon />}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" variant="outlined" color="secondary" startIcon={<LoginIcon />}>
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddAlt1Icon />}
                  >
                    Register
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
              path="/stories/create"
              element={
                <ProtectedRoute>
                  <CreateStoryPage />
                </ProtectedRoute>
              }
            />
            <Route path="/stories/:id" element={<StoryDetailPage />} />
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
