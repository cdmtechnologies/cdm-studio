import { aieng } from './aieng'
import { analytics } from './analytics'
import { cloud } from './cloud'
import { cyber } from './cyber'
import { ethhack } from './ethhack'
import { ml } from './ml'
import { python } from './python'
import { sql } from './sql'
import type { Course } from './types'

export const COURSES: Course[] = [python, sql, aieng, ml, analytics, cyber, ethhack, cloud]
