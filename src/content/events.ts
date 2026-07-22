/**
 * 40+ story events across all required categories. Pure data consumed by the
 * events engine (src/game-engine/events.ts). Choices deliberately avoid a single
 * always-correct answer: most trade one resource/relationship for another.
 */

import type { StoryEvent } from "@/game-engine/types";

export const STORY_EVENTS: StoryEvent[] = [
  // ---------------- Coach conflict ----------------
  {
    id: "ev-coach-benched",
    title: "Pulled from the Rotation",
    description:
      "The position coach benches you after a shaky practice and doesn't explain why.",
    category: "coachConflict",
    rarity: "common",
    choices: [
      {
        id: "ask",
        label: "Ask for honest feedback",
        immediate: { coachTrust: 4, stress: 3 },
        relationships: { positionCoach: 5 },
        outcomeText: "The coach respects your maturity and outlines a plan.",
      },
      {
        id: "sulk",
        label: "Sulk and vent to teammates",
        immediate: { morale: 4, coachTrust: -8, teamChemistry: -3 },
        relationships: { positionCoach: -6 },
        outcomeText: "Word gets back to the staff. Not a good look.",
      },
      {
        id: "grind",
        label: "Say nothing and outwork everyone",
        immediate: { fatigue: 10, coachTrust: 2 },
        attributeDelta: { workEthic: 1.5 },
        outcomeText: "Actions over words — the staff notices your extra reps.",
      },
    ],
  },
  {
    id: "ev-coach-scheme",
    title: "Scheme Disagreement",
    description:
      "You think the game plan misuses your skills. The coordinator disagrees.",
    category: "coachConflict",
    rarity: "uncommon",
    trigger: { minCoachTrust: 45 },
    choices: [
      {
        id: "pitch",
        label: "Pitch a tweak respectfully",
        immediate: { coachTrust: 3 },
        relationships: { headCoach: 3 },
        delayed: {
          weeks: 1,
          effects: { confidence: 4 },
          text: "They tried your idea — and it worked.",
        },
        outcomeText: "The coordinator agrees to try it Saturday.",
      },
      {
        id: "defer",
        label: "Defer to the coaches",
        immediate: { coachTrust: 5, confidence: -2 },
        outcomeText: "You buy in fully. Trust rises.",
      },
    ],
  },

  // ---------------- Teammate rivalry ----------------
  {
    id: "ev-rival-reps",
    title: "Fighting for Reps",
    description:
      "Your position rival is getting first-team reps you feel you earned.",
    category: "teammateRivalry",
    rarity: "common",
    choices: [
      {
        id: "compete",
        label: "Let your play do the talking",
        immediate: { fatigue: 8, confidence: 3 },
        attributeDelta: { awareness: 1 },
        relationships: { rival: 2 },
        outcomeText: "You push each other and both get better.",
      },
      {
        id: "undermine",
        label: "Subtly undermine them",
        immediate: { teamChemistry: -6, coachTrust: -3 },
        relationships: { rival: -12, bestFriend: -3 },
        outcomeText: "The locker room notices. It sours the room.",
      },
    ],
  },
  {
    id: "ev-rival-injury",
    title: "The Rival Goes Down",
    description: "Your rival tweaks a hamstring. The starting job may open up.",
    category: "teammateRivalry",
    rarity: "uncommon",
    choices: [
      {
        id: "support",
        label: "Support them through rehab",
        immediate: { morale: 4 },
        relationships: { rival: 10, unitLeader: 4 },
        outcomeText: "You win a friend and a lifelong ally.",
      },
      {
        id: "seize",
        label: "Seize the opportunity coldly",
        immediate: { coachTrust: 3, confidence: 4 },
        relationships: { rival: -8 },
        outcomeText: "You make the most of the reps, but the rivalry hardens.",
      },
    ],
  },

  // ---------------- Team leadership ----------------
  {
    id: "ev-lead-huddle",
    title: "Someone Has to Speak Up",
    description: "The team is flat at halftime. Eyes turn to you.",
    category: "teamLeadership",
    rarity: "common",
    trigger: {
      requiresRole: [
        "Starter",
        "Captain",
        "Conference Star",
        "National Star",
        "Rotational",
      ],
    },
    choices: [
      {
        id: "fire",
        label: "Deliver a fiery speech",
        immediate: { teamChemistry: 8, morale: 6 },
        relationships: { unitLeader: 5 },
        attributeDelta: { leadership: 2 },
        outcomeText: "The team responds with a spark.",
      },
      {
        id: "quiet",
        label: "Lead quietly by example",
        immediate: { teamChemistry: 4, confidence: 3 },
        attributeDelta: { leadership: 1 },
        outcomeText: "You let your play set the tone.",
      },
    ],
  },
  {
    id: "ev-lead-vote",
    title: "Captain Vote",
    description: "Teammates are nominating captains for the season.",
    category: "teamLeadership",
    rarity: "uncommon",
    seasons: [2, 3, 4],
    trigger: { minReputation: 35 },
    choices: [
      {
        id: "campaign",
        label: "Earn it through service",
        immediate: { fatigue: 6 },
        relationships: { unitLeader: 6, headCoach: 4 },
        attributeDelta: { leadership: 2.5 },
        outcomeText: "Your quiet leadership earns real votes.",
      },
      {
        id: "decline",
        label: "Focus only on your game",
        immediate: { confidence: 3 },
        relationships: { unitLeader: -3 },
        outcomeText: "You pass on the role to protect your focus.",
      },
    ],
  },

  // ---------------- Academic pressure ----------------
  {
    id: "ev-acad-exam",
    title: "Exam Week Crunch",
    description: "A major exam collides with your toughest practice week.",
    category: "academicPressure",
    rarity: "common",
    choices: [
      {
        id: "study",
        label: "Prioritize the exam",
        immediate: { academicFocus: 12, gpa: 0.05, fatigue: 6, coachTrust: -2 },
        outcomeText: "You ace it, but miss a film session.",
      },
      {
        id: "ball",
        label: "Prioritize football",
        immediate: { coachTrust: 4, gpa: -0.08, academicFocus: -6 },
        outcomeText: "Great week on the field; the grade takes a hit.",
      },
      {
        id: "balance",
        label: "Pull an all-nighter for both",
        immediate: { energy: -20, stress: 12, gpa: 0.02 },
        outcomeText: "You survive both, but you're running on fumes.",
      },
    ],
  },
  {
    id: "ev-acad-probation",
    title: "Academic Warning",
    description: "The advisor flags your GPA as a risk to eligibility.",
    category: "academicPressure",
    rarity: "uncommon",
    trigger: { maxGpa: 2.6 },
    choices: [
      {
        id: "tutor",
        label: "Commit to a tutoring plan",
        immediate: { academicFocus: 16, stress: -4, gpa: 0.1 },
        relationships: { academicAdvisor: 8 },
        outcomeText: "You get ahead of it. The advisor is relieved.",
      },
      {
        id: "ignore",
        label: "Roll the dice",
        immediate: { stress: 6 },
        delayed: {
          weeks: 2,
          effects: { gpa: -0.15 },
          text: "The grades slipped further — eligibility is now at risk.",
        },
        outcomeText: "You bet on yourself. Risky.",
      },
    ],
  },

  // ---------------- Family ----------------
  {
    id: "ev-family-home",
    title: "Trouble Back Home",
    description: "A family member is going through a hard time and needs you.",
    category: "family",
    rarity: "common",
    choices: [
      {
        id: "visit",
        label: "Travel home for the weekend",
        immediate: { energy: -14, morale: 8, coachTrust: -3 },
        relationships: { family: 12 },
        outcomeText: "Being there matters. You return grounded.",
      },
      {
        id: "call",
        label: "Stay and call every night",
        immediate: { morale: 3, stress: 5 },
        relationships: { family: 5 },
        outcomeText: "You stay on schedule but feel the pull.",
      },
    ],
  },
  {
    id: "ev-family-support",
    title: "Sending Money Home",
    description:
      "Your family could use financial help, and you've earned some deal money.",
    category: "family",
    rarity: "uncommon",
    trigger: { minSocialFollowing: 2000 },
    choices: [
      {
        id: "send",
        label: "Send what you can",
        immediate: { money: -1500, morale: 10 },
        relationships: { family: 14 },
        outcomeText: "It means the world to them.",
      },
      {
        id: "save",
        label: "Save for your future",
        immediate: { money: 0, morale: -3 },
        relationships: { family: -2 },
        outcomeText: "A responsible call that still stings a little.",
      },
    ],
  },

  // ---------------- Campus life ----------------
  {
    id: "ev-campus-party",
    title: "Big Party Before a Game",
    description:
      "There's a huge party the night before kickoff. Everyone's going.",
    category: "campusLife",
    rarity: "common",
    choices: [
      {
        id: "skip",
        label: "Skip it and rest",
        immediate: { energy: 12, morale: -3, campusReputation: -2 },
        outcomeText: "You're fresh for kickoff.",
      },
      {
        id: "brief",
        label: "Show face for an hour",
        immediate: { energy: -6, campusReputation: 4, morale: 4 },
        outcomeText: "You balance fun and focus.",
      },
      {
        id: "allin",
        label: "Go all in",
        immediate: { energy: -18, fatigue: 12, campusReputation: 6, morale: 6 },
        delayed: {
          weeks: 0,
          effects: { confidence: -3 },
          text: "You felt a step slow the next day.",
        },
        outcomeText: "A great night — with a price on Saturday.",
      },
    ],
  },
  {
    id: "ev-campus-club",
    title: "Join a Student Org",
    description: "A campus organization wants you as a member and face.",
    category: "campusLife",
    rarity: "uncommon",
    choices: [
      {
        id: "join",
        label: "Join and get involved",
        immediate: { campusReputation: 8, socialFollowing: 300, energy: -6 },
        outcomeText: "You broaden your campus footprint.",
      },
      {
        id: "pass",
        label: "Keep your circle small",
        immediate: { academicFocus: 4 },
        outcomeText: "You protect your time and routine.",
      },
    ],
  },

  // ---------------- Media interview ----------------
  {
    id: "ev-media-firstpresser",
    title: "Your First Press Conference",
    description: "Local reporters want your take after a breakout game.",
    category: "mediaInterview",
    rarity: "common",
    choices: [
      {
        id: "humble",
        label: "Credit your teammates",
        immediate: { teamChemistry: 6, nationalReputation: 3 },
        relationships: { journalist: 6, unitLeader: 4 },
        outcomeText: "A class act. Teammates love it.",
      },
      {
        id: "bold",
        label: "Make a bold prediction",
        immediate: {
          nationalReputation: 8,
          socialFollowing: 800,
          coachTrust: -3,
        },
        relationships: { journalist: 3 },
        outcomeText: "The clip goes viral — coaches wince a little.",
      },
    ],
  },
  {
    id: "ev-media-tough",
    title: "A Tough Question",
    description: "A reporter presses you on the team's losing streak.",
    category: "mediaInterview",
    rarity: "uncommon",
    choices: [
      {
        id: "accountable",
        label: "Take accountability",
        immediate: { coachTrust: 5, nationalReputation: 2 },
        relationships: { journalist: 5, headCoach: 4 },
        outcomeText: "Mature and steady. It earns respect.",
      },
      {
        id: "deflect",
        label: "Deflect to the scheme",
        immediate: { coachTrust: -6 },
        relationships: { headCoach: -6, journalist: -2 },
        outcomeText: "The staff isn't thrilled to be thrown under the bus.",
      },
    ],
  },

  // ---------------- Social media controversy ----------------
  {
    id: "ev-social-oldpost",
    title: "An Old Post Resurfaces",
    description:
      "A years-old post of yours is getting attention for the wrong reasons.",
    category: "socialMedia",
    rarity: "uncommon",
    choices: [
      {
        id: "apologize",
        label: "Address it sincerely",
        immediate: { nationalReputation: -2, stress: 6 },
        relationships: { journalist: 4, sponsorRep: 3 },
        outcomeText: "You own it and move forward.",
      },
      {
        id: "ignore",
        label: "Say nothing",
        immediate: { stress: 4 },
        delayed: {
          weeks: 1,
          effects: { nationalReputation: -6, socialFollowing: -500 },
          text: "The silence let it fester.",
        },
        outcomeText: "You hope it blows over.",
      },
    ],
  },
  {
    id: "ev-social-viral",
    title: "A Post Goes Viral",
    description: "A funny clip of you blows up overnight.",
    category: "socialMedia",
    rarity: "common",
    choices: [
      {
        id: "lean",
        label: "Lean into the moment",
        immediate: {
          socialFollowing: 4000,
          campusReputation: 5,
          academicFocus: -4,
        },
        outcomeText: "Your following spikes.",
      },
      {
        id: "lowkey",
        label: "Stay low-key",
        immediate: { socialFollowing: 800, academicFocus: 3 },
        outcomeText: "You keep your head down and your routine intact.",
      },
    ],
  },

  // ---------------- Injury recovery ----------------
  {
    id: "ev-injury-rush",
    title: "Rushing Back",
    description: "You're ahead of schedule on a rehab and want to play early.",
    category: "injuryRecovery",
    rarity: "uncommon",
    choices: [
      {
        id: "wait",
        label: "Follow the trainer's timeline",
        immediate: { health: 10, coachTrust: 2 },
        relationships: { trainer: 8 },
        outcomeText: "You come back fully healthy.",
      },
      {
        id: "rush",
        label: "Push to return early",
        immediate: { coachTrust: 4, health: -8, injuryRisk: 15 },
        relationships: { trainer: -6 },
        delayed: {
          weeks: 1,
          effects: { health: -10 },
          text: "You aggravated the injury coming back too soon.",
        },
        outcomeText: "You're back — but not 100%.",
      },
    ],
  },
  {
    id: "ev-injury-mental",
    title: "Getting Your Confidence Back",
    description: "Since the injury, you've been hesitant on the field.",
    category: "injuryRecovery",
    rarity: "common",
    choices: [
      {
        id: "sports-psych",
        label: "See the sports psychologist",
        immediate: { confidence: 10, stress: -8 },
        relationships: { trainer: 4 },
        outcomeText: "You rebuild trust in your body.",
      },
      {
        id: "tough",
        label: "Tough it out alone",
        immediate: { confidence: 3, stress: 4 },
        attributeDelta: { discipline: 1 },
        outcomeText: "Slow progress, but progress.",
      },
    ],
  },

  // ---------------- Booster pressure ----------------
  {
    id: "ev-booster-dinner",
    title: "The Booster Dinner",
    description:
      "A wealthy booster invites you to an exclusive dinner with strings attached.",
    category: "boosterPressure",
    rarity: "uncommon",
    trigger: { minReputation: 40 },
    choices: [
      {
        id: "attend",
        label: "Attend and network",
        immediate: { money: 500, nationalReputation: 3, coachTrust: -2 },
        relationships: { sponsorRep: 5 },
        outcomeText: "Connections made, but you feel the obligation.",
      },
      {
        id: "decline",
        label: "Politely decline",
        immediate: { coachTrust: 3 },
        relationships: { headCoach: 3 },
        outcomeText: "You keep things clean. The staff approves.",
      },
    ],
  },

  // ---------------- Sponsor conflict ----------------
  {
    id: "ev-sponsor-clash",
    title: "Competing Offers",
    description:
      "A new brand wants you, but it conflicts with an existing deal's clause.",
    category: "sponsorConflict",
    rarity: "uncommon",
    trigger: { minSocialFollowing: 5000 },
    choices: [
      {
        id: "honor",
        label: "Honor your current deal",
        immediate: { money: 0 },
        relationships: { sponsorRep: 8 },
        outcomeText: "Loyalty pays off in trust.",
      },
      {
        id: "break",
        label: "Chase the bigger bag",
        immediate: { money: 2000, nationalReputation: 2 },
        relationships: { sponsorRep: -12 },
        delayed: {
          weeks: 1,
          effects: { money: -1000 },
          text: "The broken clause triggered a penalty.",
        },
        outcomeText: "More money now, burned bridge later.",
      },
    ],
  },

  // ---------------- Transfer opportunity ----------------
  {
    id: "ev-transfer-portal",
    title: "A Program Comes Calling",
    description:
      "A bigger program hints they'd love to have you if you transferred.",
    category: "transferOpportunity",
    rarity: "rare",
    seasons: [2, 3],
    choices: [
      {
        id: "stay",
        label: "Stay loyal to your school",
        immediate: { teamChemistry: 8, coachTrust: 6, morale: 5 },
        relationships: { headCoach: 8, unitLeader: 5 },
        outcomeText: "Your teammates rally around you.",
      },
      {
        id: "explore",
        label: "Explore the opportunity",
        immediate: { coachTrust: -8, teamChemistry: -6, nationalReputation: 3 },
        relationships: { headCoach: -10 },
        outcomeText: "Word spreads that your eyes are wandering.",
      },
    ],
  },

  // ---------------- Position change request ----------------
  {
    id: "ev-position-change",
    title: "A New Position?",
    description:
      "Coaches float the idea of moving you to a new position for the team's sake.",
    category: "positionChange",
    rarity: "rare",
    choices: [
      {
        id: "embrace",
        label: "Embrace the team-first move",
        immediate: { coachTrust: 8, teamChemistry: 6, confidence: -4 },
        attributeDelta: { footballIQ: 2 },
        outcomeText: "Versatility can raise your draft profile.",
      },
      {
        id: "refuse",
        label: "Insist on your natural spot",
        immediate: { coachTrust: -6, confidence: 4 },
        outcomeText: "You bet on your primary position.",
      },
    ],
  },

  // ---------------- Rule violation ----------------
  {
    id: "ev-rule-curfew",
    title: "Missed Curfew",
    description: "You got back to the dorm well past team curfew.",
    category: "ruleViolation",
    rarity: "common",
    choices: [
      {
        id: "confess",
        label: "Own up to it immediately",
        immediate: { coachTrust: -3 },
        relationships: { headCoach: 2 },
        outcomeText: "Honesty limits the damage.",
      },
      {
        id: "hide",
        label: "Hope no one noticed",
        immediate: { stress: 6 },
        delayed: {
          weeks: 1,
          effects: { coachTrust: -8 },
          text: "They found out — and the cover-up made it worse.",
        },
        outcomeText: "You dodge it... for now.",
      },
    ],
  },

  // ---------------- Community service ----------------
  {
    id: "ev-community-hospital",
    title: "Children's Hospital Visit",
    description: "The team organizes a visit to the local children's hospital.",
    category: "communityService",
    rarity: "common",
    choices: [
      {
        id: "go",
        label: "Show up and give your time",
        immediate: { morale: 10, campusReputation: 6, energy: -6 },
        relationships: { journalist: 4 },
        outcomeText: "A humbling, meaningful day.",
      },
      {
        id: "skip",
        label: "Skip to train instead",
        immediate: { fatigue: 8, campusReputation: -4 },
        attributeDelta: { workEthic: 1 },
        outcomeText: "You got extra reps, but missed a moment.",
      },
    ],
  },

  // ---------------- Championship pressure ----------------
  {
    id: "ev-champ-spotlight",
    title: "Under the Lights",
    description: "It's the biggest game of your life. The pressure is immense.",
    category: "championshipPressure",
    rarity: "rare",
    seasons: [2, 3, 4],
    trigger: { minReputation: 50 },
    choices: [
      {
        id: "embrace",
        label: "Embrace the moment",
        immediate: { confidence: 10, nationalReputation: 5, stress: 4 },
        attributeDelta: { awareness: 1.5 },
        outcomeText: "You were built for this.",
      },
      {
        id: "tighten",
        label: "Try not to lose it",
        immediate: { stress: 10, confidence: -4 },
        outcomeText: "The nerves are getting to you.",
      },
    ],
  },

  // ---------------- Draft prep ----------------
  {
    id: "ev-draft-advisor",
    title: "Hiring a Draft Advisor",
    description:
      "An advisor offers to guide your pre-draft process — for a fee.",
    category: "draftPrep",
    rarity: "uncommon",
    seasons: [3, 4],
    choices: [
      {
        id: "hire",
        label: "Invest in the advisor",
        immediate: { money: -3000, draftStock: 4 },
        relationships: { agent: 12 },
        outcomeText: "Expert guidance sharpens your stock.",
      },
      {
        id: "diy",
        label: "Prepare on your own",
        immediate: { draftStock: 1, stress: 6 },
        outcomeText: "You save the money and grind solo.",
      },
    ],
  },
  {
    id: "ev-draft-combine-invite",
    title: "Combine Invitation",
    description: "You're invited to the fictional pre-draft combine.",
    category: "draftPrep",
    rarity: "rare",
    seasons: [4],
    choices: [
      {
        id: "train",
        label: "Train specifically for the tests",
        immediate: { fatigue: 10, draftStock: 5 },
        attributeDelta: { speed: 1, agility: 1 },
        outcomeText: "You dial in your 40 and shuttle.",
      },
      {
        id: "film",
        label: "Trust your game film",
        immediate: { draftStock: 2, confidence: 3 },
        outcomeText: "You bet on the tape over the tests.",
      },
    ],
  },

  // ---------------- Extra depth (to exceed 40) ----------------
  {
    id: "ev-coach-earlywake",
    title: "5 AM Film Invitation",
    description:
      "The head coach invites a small group to early-morning film sessions.",
    category: "coachConflict",
    rarity: "common",
    choices: [
      {
        id: "attend",
        label: "Be there every morning",
        immediate: { energy: -8, coachTrust: 8 },
        attributeDelta: { footballIQ: 2 },
        relationships: { headCoach: 6 },
        outcomeText: "Your prep separates you from the pack.",
      },
      {
        id: "sleep",
        label: "Protect your sleep",
        immediate: { energy: 6, coachTrust: -4 },
        outcomeText: "You're rested but miss the inner circle.",
      },
    ],
  },
  {
    id: "ev-team-newcomer",
    title: "Mentoring a Freshman",
    description: "A nervous freshman looks up to you.",
    category: "teamLeadership",
    rarity: "common",
    seasons: [3, 4],
    choices: [
      {
        id: "mentor",
        label: "Take them under your wing",
        immediate: { teamChemistry: 8, morale: 5 },
        attributeDelta: { leadership: 2 },
        relationships: { unitLeader: 4 },
        outcomeText: "You pay forward what you learned.",
      },
      {
        id: "focus",
        label: "Stay focused on yourself",
        immediate: { confidence: 2 },
        outcomeText: "You keep your blinders on.",
      },
    ],
  },
  {
    id: "ev-acad-groupproject",
    title: "The Group Project",
    description: "Your group is slacking and the deadline is near.",
    category: "academicPressure",
    rarity: "common",
    choices: [
      {
        id: "carry",
        label: "Carry the group",
        immediate: { academicFocus: 8, gpa: 0.05, energy: -10, stress: 8 },
        outcomeText: "You save the grade but pay in energy.",
      },
      {
        id: "delegate",
        label: "Delegate and hold them accountable",
        immediate: { academicFocus: 4, gpa: 0.02 },
        attributeDelta: { leadership: 1 },
        outcomeText: "You get them to pull their weight.",
      },
    ],
  },
  {
    id: "ev-campus-hometown-hero",
    title: "Hometown Feature",
    description: "Your hometown paper wants to feature your journey.",
    category: "mediaInterview",
    rarity: "uncommon",
    choices: [
      {
        id: "yes",
        label: "Do the feature",
        immediate: { campusReputation: 6, socialFollowing: 1200, morale: 6 },
        relationships: { family: 6, journalist: 4 },
        outcomeText: "Your community beams with pride.",
      },
      {
        id: "no",
        label: "Keep it private",
        immediate: { academicFocus: 3 },
        outcomeText: "You keep the spotlight low.",
      },
    ],
  },
  {
    id: "ev-social-charity-stream",
    title: "Charity Livestream",
    description: "You're asked to headline a charity gaming stream.",
    category: "socialMedia",
    rarity: "common",
    choices: [
      {
        id: "host",
        label: "Host the stream",
        immediate: {
          socialFollowing: 2500,
          campusReputation: 5,
          energy: -8,
          money: 300,
        },
        relationships: { sponsorRep: 4 },
        outcomeText: "You raise real money and real followers.",
      },
      {
        id: "decline",
        label: "Decline — too busy",
        immediate: { academicFocus: 4 },
        outcomeText: "You protect your schedule.",
      },
    ],
  },
  {
    id: "ev-booster-car",
    title: "A Suspicious Gift",
    description: "A booster offers you a 'loaner' luxury car with a wink.",
    category: "boosterPressure",
    rarity: "rare",
    choices: [
      {
        id: "refuse",
        label: "Refuse the gift",
        immediate: { coachTrust: 6 },
        relationships: { headCoach: 6, academicAdvisor: 4 },
        outcomeText: "You keep your eligibility spotless.",
      },
      {
        id: "accept",
        label: "Accept quietly",
        immediate: { morale: 5 },
        delayed: {
          weeks: 2,
          effects: { coachTrust: -15, nationalReputation: -8 },
          text: "Compliance came knocking. Serious trouble.",
        },
        outcomeText: "A risky, shortsighted call.",
      },
    ],
  },
  {
    id: "ev-injury-teammate",
    title: "A Teammate's Injury",
    description: "Your best friend on the team suffers a season-ending injury.",
    category: "injuryRecovery",
    rarity: "uncommon",
    choices: [
      {
        id: "rally",
        label: "Dedicate your season to them",
        immediate: { morale: 6, confidence: 5, teamChemistry: 6 },
        relationships: { bestFriend: 12 },
        outcomeText: "You play with new purpose.",
      },
      {
        id: "distance",
        label: "Bury yourself in your own game",
        immediate: { confidence: 2, stress: 4 },
        relationships: { bestFriend: -4 },
        outcomeText: "You cope by tunneling in.",
      },
    ],
  },
  {
    id: "ev-sponsor-firstbig",
    title: "First Big Offer",
    description: "A regional brand makes your first serious NIL offer.",
    category: "sponsorConflict",
    rarity: "uncommon",
    trigger: { minSocialFollowing: 8000 },
    choices: [
      {
        id: "negotiate",
        label: "Negotiate for more",
        immediate: { money: 500, nationalReputation: 2 },
        relationships: { agent: 6, sponsorRep: -2 },
        outcomeText: "You push and land a better rate.",
      },
      {
        id: "accept",
        label: "Accept gratefully",
        immediate: { money: 800 },
        relationships: { sponsorRep: 6 },
        outcomeText: "You build goodwill for future deals.",
      },
    ],
  },
  {
    id: "ev-champ-rival-week",
    title: "Rivalry Week Media Storm",
    description: "The rival's star talks trash about you all week.",
    category: "championshipPressure",
    rarity: "common",
    choices: [
      {
        id: "ignore",
        label: "Stay locked in",
        immediate: { confidence: 4, coachTrust: 3 },
        outcomeText: "You let your game answer.",
      },
      {
        id: "clapback",
        label: "Fire back publicly",
        immediate: {
          nationalReputation: 5,
          socialFollowing: 1500,
          coachTrust: -4,
        },
        relationships: { rival: -8 },
        outcomeText: "The internet loves it; coaches don't.",
      },
    ],
  },
  {
    id: "ev-community-camp",
    title: "Youth Football Camp",
    description: "You're asked to run drills at a youth camp.",
    category: "communityService",
    rarity: "common",
    choices: [
      {
        id: "lead",
        label: "Lead the camp",
        immediate: { campusReputation: 7, morale: 8, energy: -8 },
        attributeDelta: { leadership: 1.5 },
        outcomeText: "The kids adore you — and it feels great.",
      },
      {
        id: "cameo",
        label: "Make a short cameo",
        immediate: { campusReputation: 3, energy: -3 },
        outcomeText: "You stop by briefly.",
      },
    ],
  },
  {
    id: "ev-acad-major-choice",
    title: "Declaring a Major",
    description: "It's time to commit to a degree path.",
    category: "academicPressure",
    rarity: "uncommon",
    seasons: [2],
    choices: [
      {
        id: "passion",
        label: "Follow your academic strength",
        immediate: { academicFocus: 8, gpa: 0.05, morale: 5 },
        relationships: { academicAdvisor: 6 },
        outcomeText: "You pick a path you can thrive in.",
      },
      {
        id: "easy",
        label: "Pick the easiest path",
        immediate: { academicFocus: 4, gpa: 0.02 },
        outcomeText: "You prioritize eligibility over passion.",
      },
    ],
  },
  {
    id: "ev-family-firstgame",
    title: "Family in the Stands",
    description: "Your whole family drives in for your first big start.",
    category: "family",
    rarity: "common",
    choices: [
      {
        id: "dedicate",
        label: "Dedicate the game to them",
        immediate: { confidence: 8, morale: 8 },
        relationships: { family: 10 },
        outcomeText: "You play inspired.",
      },
      {
        id: "nerves",
        label: "Feel the added pressure",
        immediate: { stress: 8, confidence: -2 },
        outcomeText: "You press a little, wanting to impress.",
      },
    ],
  },
  {
    id: "ev-campus-tutor-crush",
    title: "Balancing a New Relationship",
    description: "A new relationship is competing for your limited time.",
    category: "campusLife",
    rarity: "common",
    choices: [
      {
        id: "balance",
        label: "Set healthy boundaries",
        immediate: { morale: 8, stress: -6, academicFocus: 2 },
        outcomeText: "You find a sustainable balance.",
      },
      {
        id: "distract",
        label: "Let it consume your focus",
        immediate: { morale: 10, academicFocus: -8, coachTrust: -3 },
        outcomeText: "You're happy, but slipping in prep.",
      },
    ],
  },
  {
    id: "ev-media-podcast",
    title: "Podcast Invitation",
    description: "A popular sports podcast wants you as a guest.",
    category: "mediaInterview",
    rarity: "uncommon",
    trigger: { minReputation: 45 },
    choices: [
      {
        id: "go",
        label: "Go on the show",
        immediate: { nationalReputation: 8, socialFollowing: 3000, energy: -6 },
        relationships: { journalist: 5 },
        outcomeText: "You handle it like a pro.",
      },
      {
        id: "pass",
        label: "Pass for now",
        immediate: { academicFocus: 3 },
        outcomeText: "You keep the focus on ball.",
      },
    ],
  },
  {
    id: "ev-rule-social-slip",
    title: "A Heated DM Leaks",
    description: "A private argument you had leaks publicly.",
    category: "ruleViolation",
    rarity: "uncommon",
    choices: [
      {
        id: "apologize",
        label: "Apologize and take a break",
        immediate: { nationalReputation: -3, stress: 6, socialFollowing: -300 },
        relationships: { sponsorRep: 2 },
        outcomeText: "You defuse it with maturity.",
      },
      {
        id: "double",
        label: "Double down",
        immediate: {
          socialFollowing: 500,
          coachTrust: -6,
          nationalReputation: -4,
        },
        relationships: { headCoach: -5 },
        outcomeText: "It escalates and coaches step in.",
      },
    ],
  },
  {
    id: "ev-draft-mock",
    title: "Mock Draft Buzz",
    description: "A mock draft slots you higher than expected.",
    category: "draftPrep",
    rarity: "uncommon",
    seasons: [3, 4],
    choices: [
      {
        id: "fuel",
        label: "Use it as fuel",
        immediate: { confidence: 6, draftStock: 3 },
        outcomeText: "You channel the hype into work.",
      },
      {
        id: "coast",
        label: "Start to coast",
        immediate: { confidence: 4, coachTrust: -3 },
        delayed: {
          weeks: 2,
          effects: { draftStock: -4 },
          text: "Complacency showed up on tape.",
        },
        outcomeText: "You ease off the gas — a mistake.",
      },
    ],
  },
  {
    id: "ev-team-players-only",
    title: "Players-Only Meeting",
    description: "The team calls a players-only meeting after a bad loss.",
    category: "teamLeadership",
    rarity: "uncommon",
    choices: [
      {
        id: "speak",
        label: "Address the team honestly",
        immediate: { teamChemistry: 10, morale: 4 },
        attributeDelta: { leadership: 2 },
        relationships: { unitLeader: 6 },
        outcomeText: "You help refocus the room.",
      },
      {
        id: "listen",
        label: "Listen and absorb",
        immediate: { teamChemistry: 4 },
        outcomeText: "You take it all in quietly.",
      },
    ],
  },
  {
    id: "ev-position-special-teams",
    title: "Special Teams Ask",
    description: "Coaches want you to contribute on special teams too.",
    category: "positionChange",
    rarity: "common",
    choices: [
      {
        id: "accept",
        label: "Embrace the extra role",
        immediate: { coachTrust: 6, fatigue: 8, campusReputation: 3 },
        outcomeText: "You show you'll do anything to help.",
      },
      {
        id: "decline",
        label: "Protect your legs",
        immediate: { coachTrust: -3, energy: 4 },
        outcomeText: "You stay fresh for your primary role.",
      },
    ],
  },
  {
    id: "ev-sponsor-charity-match",
    title: "Matching a Cause",
    description: "A sponsor offers to match any charitable donation you make.",
    category: "communityService",
    rarity: "uncommon",
    trigger: { minSocialFollowing: 10000 },
    choices: [
      {
        id: "give",
        label: "Donate and promote it",
        immediate: { money: -1000, campusReputation: 8, socialFollowing: 2000 },
        relationships: { sponsorRep: 8, journalist: 4 },
        outcomeText: "A win for the cause and your brand.",
      },
      {
        id: "small",
        label: "Give a token amount",
        immediate: { money: -200, campusReputation: 2 },
        outcomeText: "You contribute modestly.",
      },
    ],
  },
];

export function getEvent(id: string): StoryEvent | undefined {
  return STORY_EVENTS.find((e) => e.id === id);
}
