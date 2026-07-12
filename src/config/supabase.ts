import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const isPlaceholder = !supabaseUrl || !supabaseKey || supabaseKey.includes('placeholder');

if (isPlaceholder) {
    console.warn("WARNING: Missing SUPABASE_URL or SUPABASE_KEY. Using local SQLite & JSON mock client fallback.");
}

// Mock database file
const MOCK_FILE = path.join(process.cwd(), 'supabase_mock.json');

function readDb() {
  if (!fs.existsSync(MOCK_FILE)) {
    fs.writeFileSync(MOCK_FILE, JSON.stringify({
      vehicles: [],
      drivers: [],
      trips: [],
      maintenance: [],
      fuel_logs: [],
      expense_logs: [],
      trip_logs: [],
      maintenance_logs: []
    }, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_FILE, 'utf8'));
  } catch (e) {
    return {
      vehicles: [],
      drivers: [],
      trips: [],
      maintenance: [],
      fuel_logs: [],
      expense_logs: [],
      trip_logs: [],
      maintenance_logs: []
    };
  }
}

function writeDb(data: any) {
  fs.writeFileSync(MOCK_FILE, JSON.stringify(data, null, 2));
}

class MockBuilder {
  private table: string;
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private insertData: any = null;
  private updateData: any = null;
  private filters: Array<{ col: string; op: 'eq' | 'neq'; val: any }> = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, options?: any) {
    this.op = 'select';
    return this;
  }

  insert(values: any | any[]) {
    this.op = 'insert';
    this.insertData = Array.isArray(values) ? values : [values];
    return this;
  }

  update(values: any) {
    this.op = 'update';
    this.updateData = values;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ col: column, op: 'eq', val: value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ col: column, op: 'neq', val: value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAsc = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  // Thenable interface so it can be awaited
  async then(resolve: any, reject: any) {
    try {
      const res = await this.execute();
      resolve(res);
    } catch (err) {
      if (reject) reject(err);
    }
  }

  private async execute() {
    const db = readDb();
    if (!db[this.table]) {
      db[this.table] = [];
    }

    let list = [...db[this.table]];

    // Apply filters
    for (const f of this.filters) {
      if (f.op === 'eq') {
        list = list.filter(item => String(item[f.col]) === String(f.val));
      } else if (f.op === 'neq') {
        list = list.filter(item => String(item[f.col]) !== String(f.val));
      }
    }

    // Apply sorting
    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAsc;
      list.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return asc ? valA - valB : valB - valA;
        }
        return asc 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      list = list.slice(0, this.limitCount);
    }

    if (this.op === 'select') {
      // Simulate joins: trips needs vehicles and drivers
      if (this.table === 'trips' || this.table === 'maintenance' || this.table === 'fuel_logs' || this.table === 'expense_logs' || this.table === 'maintenance_logs') {
        list = list.map(item => {
          const newItem = { ...item };
          if (newItem.vehicle_id) {
            const vehicle = db.vehicles.find((v: any) => String(v.id) === String(newItem.vehicle_id));
            newItem.vehicles = vehicle || null;
          }
          if (newItem.driver_id) {
            const driver = db.drivers.find((d: any) => String(d.id) === String(newItem.driver_id));
            newItem.drivers = driver || null;
          }
          return newItem;
        });
      }

      if (this.isSingle) {
        if (list.length === 0) {
          return { data: null, error: { message: 'Row not found' } };
        }
        return { data: list[0], error: null };
      }
      if (this.isMaybeSingle) {
        return { data: list[0] || null, error: null };
      }
      return { data: list, error: null };
    }

    if (this.op === 'insert') {
      const newItems = this.insertData.map((item: any, idx: number) => {
        const id = item.id || (db[this.table].length + idx + 1);
        return {
          id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item
        };
      });

      db[this.table].push(...newItems);
      writeDb(db);

      if (this.isSingle || this.insertData.length === 1) {
        return { data: newItems[0], error: null };
      }
      return { data: newItems, error: null };
    }

    if (this.op === 'update') {
      const updatedItems: any[] = [];
      db[this.table] = db[this.table].map((item: any) => {
        let match = true;
        for (const f of this.filters) {
          if (f.op === 'eq' && String(item[f.col]) !== String(f.val)) match = false;
          if (f.op === 'neq' && String(item[f.col]) === String(f.val)) match = false;
        }

        if (match) {
          const updatedItem = {
            ...item,
            ...this.updateData,
            updated_at: new Date().toISOString()
          };
          updatedItems.push(updatedItem);
          return updatedItem;
        }
        return item;
      });

      writeDb(db);

      if (this.isSingle) {
        return { data: updatedItems[0] || null, error: null };
      }
      return { data: updatedItems, error: null };
    }

    if (this.op === 'delete') {
      db[this.table] = db[this.table].filter((item: any) => {
        let match = true;
        for (const f of this.filters) {
          if (f.op === 'eq' && String(item[f.col]) !== String(f.val)) match = false;
          if (f.op === 'neq' && String(item[f.col]) === String(f.val)) match = false;
        }
        return !match;
      });

      writeDb(db);
      return { error: null };
    }

    return { data: null, error: null };
  }
}

export const supabase: any = isPlaceholder
  ? {
      from: (table: string) => new MockBuilder(table)
    }
  : createClient(supabaseUrl, supabaseKey);
