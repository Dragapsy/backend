import { useEffect, useState } from 'react'
import { Box, Paper, Typography, ToggleButton, ToggleButtonGroup, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getStories } from '../api/storyApi'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { SectionTitle } from '../components/SectionTitle'
import type { StoryDTO } from '../types'

export function ListeStoriesPage() {
    const [stories, setStories] = useState<StoryDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [view, setView] = useState<'grid' | 'list'>('grid')

    const navigate = useNavigate()

    async function loadStories() {
        setLoading(true)
        setError(null)

        try {
            const data = await getStories()
            setStories(data)
        } catch {
            setError('Impossible de charger les histoires.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadStories()
    }, [])

    return (
        <Box sx={{ display: 'grid', gap: 4 }}>
        
                
                <Typography variant="h4" sx={{ mt: 0.8 }}>
                    Liste des histoires
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
                    Parcourez toutes les histoires publiées par la communauté.
                </Typography>

                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={(_, value) => value && setView(value)}
                    sx={{ mt: 2 }}
                >
                    <ToggleButton value="grid">Grille</ToggleButton>
                    <ToggleButton value="list">Liste</ToggleButton>
                </ToggleButtonGroup>

            {loading && (
                <LoadingState
                    label="Chargement des stories..."
                    description="Recuperation des histoires en cours."
                />
            )}

            {error && (
                <ErrorBanner
                    message={error}
                    actionLabel="Reessayer"
                    onAction={() => void loadStories()}
                />
            )}

            <section>

                {stories.length === 0 && !loading ? (
                    <EmptyState
                        title="Aucune histoire"
                        description="Aucune histoire disponible pour le moment."
                        actionLabel="Actualiser"
                        onAction={() => void loadStories()}
                    />
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns:
                                view === 'grid'
                                    ? { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }
                                    : '1fr',
                        }}
                    >
                        {stories.map((story) => (
                            <Paper
                                key={story.id}
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    display: 'flex',
                                    flexDirection: view === 'grid' ? 'column' : 'row',
                                    gap: 2,
                                    alignItems: view === 'grid' ? 'center' : 'flex-start',
                                    textAlign: view === 'grid' ? 'center' : 'left',
                                }}
                            >
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6">{story.title}</Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        Par {story.authorName}
                                    </Typography>

                                    {'createdAt' in story && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {new Date((story as any).createdAt).toLocaleDateString()}
                                        </Typography>
                                    )}

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 1,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {story.summary}
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        alignSelf: view === 'grid' ? 'center' : 'center',
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => navigate(`/stories/${story.id}`)}
                                    >
                                        Lire l'histoire
                                    </Button>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </section>
        </Box>
    )
}