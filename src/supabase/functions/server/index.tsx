import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check endpoint
app.get("/make-server-48e0b4cd/health", (c) => {
  return c.json({ status: "ok" });
});

// User Signup
app.post("/make-server-48e0b4cd/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: { id: data.user.id, email, name, role } 
    });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Get all active drivers with their locations and status
app.get("/make-server-48e0b4cd/drivers", async (c) => {
  try {
    const drivers = await kv.getByPrefix("driver:");
    return c.json({ drivers: drivers || [] });
  } catch (error) {
    console.log(`Error fetching drivers: ${error}`);
    return c.json({ error: "Failed to fetch drivers" }, 500);
  }
});

// Update driver status and location (requires auth)
app.post("/make-server-48e0b4cd/driver/update", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { status, route, capacity, latitude, longitude, vehicleType, plateNumber } = await c.req.json();

    const driverData = {
      userId: user.id,
      name: user.user_metadata?.name || "Unknown",
      status,
      route,
      capacity,
      location: { latitude, longitude },
      vehicleType,
      plateNumber,
      lastUpdated: new Date().toISOString()
    };

    await kv.set(`driver:${user.id}`, driverData);

    return c.json({ success: true, driver: driverData });
  } catch (error) {
    console.log(`Driver update error: ${error}`);
    return c.json({ error: "Failed to update driver status" }, 500);
  }
});

// Submit feedback
app.post("/make-server-48e0b4cd/feedback", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { driverId, rating, comment, plateNumber } = await c.req.json();

    const feedbackId = `feedback:${Date.now()}_${user.id}`;
    const feedbackData = {
      id: feedbackId,
      passengerId: user.id,
      driverId,
      plateNumber,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    await kv.set(feedbackId, feedbackData);

    return c.json({ success: true, feedback: feedbackData });
  } catch (error) {
    console.log(`Feedback submission error: ${error}`);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// Get fare guide
app.get("/make-server-48e0b4cd/fares", async (c) => {
  try {
    let fares = await kv.get("fares:maasin");
    
    // Initialize default fares if not exists
    if (!fares) {
      fares = {
        tricycle: [
          { route: "Poblacion to Combado", fare: "15-20", distance: "3km" },
          { route: "Terminal to Maasin City College", fare: "10-15", distance: "2km" },
          { route: "Public Market to City Hall", fare: "10-12", distance: "1.5km" },
          { route: "Ibarra to Poblacion", fare: "20-25", distance: "4km" },
          { route: "Guadalupe to Terminal", fare: "15-18", distance: "2.5km" }
        ],
        multicab: [
          { route: "Poblacion to Combado", fare: "15", distance: "3km" },
          { route: "Terminal to Maasin City College", fare: "12", distance: "2km" },
          { route: "Bato to Poblacion", fare: "25", distance: "6km" }
        ]
      };
      await kv.set("fares:maasin", fares);
    }

    return c.json({ fares });
  } catch (error) {
    console.log(`Error fetching fares: ${error}`);
    return c.json({ error: "Failed to fetch fare guide" }, 500);
  }
});

// Get user profile (requires auth)
app.get("/make-server-48e0b4cd/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Error fetching profile: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update user profile (requires auth)
app.put("/make-server-48e0b4cd/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, plateNumber, vehicleType } = await c.req.json();
    
    const existingProfile = await kv.get(`user:${user.id}`);
    const updatedProfile = {
      ...existingProfile,
      name,
      plateNumber,
      vehicleType,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log(`Error updating profile: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

Deno.serve(app.fetch);