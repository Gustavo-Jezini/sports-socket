import { Router } from 'express'
import { matches } from '../db/schema.js'
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js'
import { getMatchStatus } from '../utils/matches-status.js'
import { db } from '../db/db.js'
import { desc } from 'drizzle-orm'

export const matchRouter = Router()

const MAX_LIMIT = 100;

matchRouter.get('/', async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.issues });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
    .select()
    .from(matches)
    .orderBy((desc(matches.createdAt)))
    .limit(limit);

    res.status(200).json({ data })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches', details: error.message });
  }
})

matchRouter.post('/',async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }

  const { data: { homeScore, awayScore, startTime, endTime, ...rest } } = parsed;

  try {
    const [event] = await db.insert(matches).values({
      ...rest,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      homeScore,
      awayScore,
      status: getMatchStatus(startTime, endTime)
    }).returning()

    if(res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(event);
    }

    res.status(201).json({ message: 'Match created successfully', data: event });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create match', details: error.message });
  }
})