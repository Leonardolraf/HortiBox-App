// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxpzyclrzxywbhyuqrsn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cHp5Y2xyenh5d2JoeXVxcnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDgyMDMsImV4cCI6MjA2NDcyNDIwM30._3wuEG7m9_5Jo0GM3E0lZAk_qsL1HkOccxTnuz673Fw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);