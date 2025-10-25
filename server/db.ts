import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  retirementScenarios, 
  InsertRetirementScenario,
  rothConversions,
  InsertRothConversion 
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.



// Retirement Scenarios helpers
export async function createScenario(scenario: InsertRetirementScenario) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(retirementScenarios).values(scenario);
  return result;
}

export async function getUserScenarios(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(retirementScenarios)
    .where(eq(retirementScenarios.userId, userId))
    .orderBy(retirementScenarios.updatedAt);
}

export async function getScenarioById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(retirementScenarios)
    .where(eq(retirementScenarios.id, id))
    .limit(1);
  
  if (results.length === 0 || results[0].userId !== userId) return null;
  return results[0];
}

export async function updateScenario(id: number, userId: number, data: Partial<InsertRetirementScenario>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership
  const scenario = await getScenarioById(id, userId);
  if (!scenario) throw new Error("Scenario not found or access denied");
  
  await db
    .update(retirementScenarios)
    .set(data)
    .where(eq(retirementScenarios.id, id));
}

export async function deleteScenario(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verify ownership
  const scenario = await getScenarioById(id, userId);
  if (!scenario) throw new Error("Scenario not found or access denied");
  
  await db
    .delete(retirementScenarios)
    .where(eq(retirementScenarios.id, id));
}

// Roth Conversion helpers
export async function createRothConversion(conversion: InsertRothConversion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(rothConversions).values(conversion);
  return result;
}

export async function getUserRothConversions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(rothConversions)
    .where(eq(rothConversions.userId, userId))
    .orderBy(rothConversions.createdAt);
}

