import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined'
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined'
import {
    Box,
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStories } from '../api/storyApi'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import type { StoryDTO } from '../types'

function formatStoryDate(createdAt?: string) {
    if (!createdAt) {
        return 'Date indisponible'
    }

    return new Date(createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export function ListeStoriesPage() {
    const [stories, setStories] = useState<StoryDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [dateSort, setDateSort] = useState<'asc' | 'desc'>('desc')
    const [likeSort, setLikeSort] = useState<'none' | 'asc' | 'desc'>('none')

    const navigate = useNavigate()

    const sortedStories = [...stories].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        const aLikes = a.likeCount ?? 0
        const bLikes = b.likeCount ?? 0

        if (likeSort !== 'none' && aLikes !== bLikes) {
            return likeSort === 'asc' ? aLikes - bLikes : bLikes - aLikes
        }

        return dateSort === 'asc' ? aTime - bTime : bTime - aTime
    })

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
        <Box sx={{ display: 'grid', gap: 3 }}>

                <Box
                    sx={{
                        p: { xs: 2.5, md: 3.5 },
                        display: 'grid',
                        gap: 2.5,
                        gridTemplateColumns: { xs: '1fr', lg: '1.5fr 0.9fr' },
                        alignItems: 'center',
                    }}
                >
                    <Box>
                        <Chip
                            icon={<AutoStoriesOutlinedIcon />}
                            label="Bibliotheque communautaire"
                            sx={{
                                mb: 1.5,
                                backgroundColor: 'rgba(255,255,255,0.72)',
                                borderColor: 'rgba(15,23,42,0.08)',
                            }}
                            variant="outlined"
                        />
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Liste des histoires
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mt: 1.2, maxWidth: 720, lineHeight: 1.75 }}
                        >
                            Parcourez les histoires publiées par la communauté, puis triez-les par date
                            ou par popularité pour trouver votre prochaine lecture.
                        </Typography>
                    </Box>
                </Box>
        

            <Paper
                variant="outlined"
                sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 1,
                }}
            >
                <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', lg: 'center' }}
                >
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
                        <ToggleButtonGroup
                            value={view}
                            exclusive
                            onChange={(_, value) => value && setView(value)}
                            size="small"
                            color="primary"
                        >
                            <ToggleButton value="grid">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <ViewModuleOutlinedIcon fontSize="small" />
                                    <span>Grille</span>
                                </Stack>
                            </ToggleButton>
                            <ToggleButton value="list">
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <ViewAgendaOutlinedIcon fontSize="small" />
                                    <span>Liste</span>
                                </Stack>
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                            <InputLabel id="story-date-sort-label">Trier par date</InputLabel>
                            <Select
                                labelId="story-date-sort-label"
                                value={dateSort}
                                label="Trier par date"
                                onChange={(event) => setDateSort(event.target.value as 'asc' | 'desc')}
                            >
                                <MenuItem value="desc">Plus récentes d'abord</MenuItem>
                                <MenuItem value="asc">Plus anciennes d'abord</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
                            <InputLabel id="story-like-sort-label">Trier par likes</InputLabel>
                            <Select
                                labelId="story-like-sort-label"
                                value={likeSort}
                                label="Trier par likes"
                                onChange={(event) => setLikeSort(event.target.value as 'none' | 'asc' | 'desc')}
                            >
                                <MenuItem value="none">Aucun tri</MenuItem>
                                <MenuItem value="desc">Plus likées d'abord</MenuItem>
                                <MenuItem value="asc">Moins likées d'abord</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {sortedStories.length} résultat{sortedStories.length > 1 ? 's' : ''}
                    </Typography>
                </Stack>
            </Paper>

            {loading && (
                <LoadingState
                    label="Chargement des stories..."
                    description="Récupération des histoires en cours."
                />
            )}

            {error && (
                <ErrorBanner
                    message={error}
                    actionLabel="Réessayer"
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
                                    ? { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }
                                    : '1fr',
                        }}
                    >
                        {sortedStories.map((story) => {
                            const likeCount = story.likeCount ?? 0

                            return (
                                <Paper
                                    key={story.id}
                                    variant="outlined"
                                    sx={{
                                        p: 0,
                                        overflow: 'hidden',
                                        borderRadius: 2,
                                        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: view === 'grid' ? 80 : 10,
                                            background:'#364e14',
                                            opacity: 0.5,
                                        }}
                                    />

                                    <Box
                                        sx={{
                                            p: { xs: 2, md: 2.4 },
                                            display: 'grid',
                                            gap: 2,
                                            gridTemplateColumns: view === 'grid' ? '1fr' : { xs: '1fr', md: '1fr auto' },
                                            alignItems: view === 'grid' ? 'stretch' : 'center',
                                        }}
                                    >
                                        <Box>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                flexWrap="wrap"
                                                useFlexGap
                                                sx={{ mb: 1.4 }}
                                            >
                                                <Chip
                                                    size="small"
                                                    icon={<FavoriteBorderIcon />}
                                                    label={`${likeCount} like${likeCount > 1 ? 's' : ''}`}
                                                    sx={{ backgroundColor: '#f8f8f8' }}
                                                />
                                                <Chip
                                                    size="small"
                                                    icon={<CalendarTodayOutlinedIcon />}
                                                    label={formatStoryDate(story.createdAt)}
                                                    sx={{ backgroundColor: '#f8f8f8' }}
                                                />
                                            </Stack>

                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    lineHeight: 1.25,
                                                    textAlign: 'left',
                                                }}
                                            >
                                                {story.title}
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                spacing={0.75}
                                                alignItems="center"
                                                sx={{ mt: 1, color: 'text.secondary' }}
                                            >
                                                <PersonOutlineIcon sx={{ fontSize: 18 }} />
                                                <Typography variant="body2">Par {story.authorName}</Typography>
                                            </Stack>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 1.6,
                                                    lineHeight: 1.7,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: view === 'grid' ? 4 : 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                {story.summary}
                                            </Typography>
                                        </Box>

                                        <Stack
                                            spacing={1.2}
                                            alignItems={view === 'grid' ? 'stretch' : { xs: 'stretch', md: 'flex-end' }}
                                            justifyContent="space-between"
                                        >
                                            <Chip
                                                size="small"
                                                label={`${story.chapterCount} chapitre${story.chapterCount > 1 ? 's' : ''}`}
                                                variant="outlined"
                                                sx={{ width: 'fit-content' }}
                                            />

                                            <Button
                                                variant="contained"
                                                onClick={() => navigate(`/stories/${story.id}`)}
                                                sx={{
                                                    px: 2.2,
                                                    py: 1,
                                                    borderRadius: 999,
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    boxShadow: 'none',
                                                }}
                                            >
                                                Lire l'histoire
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Paper>
                            )
                        })}
                    </Box>
                )}
            </section>
        </Box>
    )
}
