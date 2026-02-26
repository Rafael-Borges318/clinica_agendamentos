// import { createClient } from "@supabase/supabase-js/dist/index.cjs";
// import dotenv from "dotenv";

// dotenv.config();

// export const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABSE_SERVICE_ROLE_KEY,
// );

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY exists:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
