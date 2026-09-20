import type { Client, InArgs, ResultSet } from '@libsql/client';
// Preserve D1's prepared-query interface and transactional batch semantics.
export function createDatabaseAdapter(client: Client): D1Database {
  const result = (r: ResultSet) => ({success:true,results:r.rows.map(row=>Object.fromEntries(r.columns.map(column=>[column,row[column]]))),meta:{changes:r.rowsAffected,last_row_id:Number(r.lastInsertRowid ?? 0)}});
  class Statement {
    sql: string;
    args: InArgs;
    constructor(sql: string, args: InArgs = []) { this.sql=sql; this.args=args; }
    bind(...args: Array<string | number | null>) { return new Statement(this.sql,args); }
    async all<T>() { return result(await client.execute({sql:this.sql,args:this.args})) as unknown as D1Result<T>; }
    async run<T>() { return this.all<T>(); }
    async first<T>(column?: string): Promise<T | null> { const r=await this.all<Record<string,unknown>>(); const row=r.results[0]; return (row ? column ? row[column] : row : null) as T | null; }
  }
  return {
    prepare(sql: string) { return new Statement(sql); },
    async batch(statements: Statement[]) { return (await client.batch(statements.map(s=>({sql:s.sql,args:s.args})), 'write')).map(result); },
  } as unknown as D1Database;
}
