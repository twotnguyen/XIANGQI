// One owning SQL suite: default Vitest file parallelism cannot race baseline resets.
import "./schema.test-cases.js";
import "./google.test-cases.js";
import "../guest/guest.test-cases.js";
import { afterAll } from "vitest";
import { pool } from "./database.test-helper.js";
afterAll(() => pool.end());
