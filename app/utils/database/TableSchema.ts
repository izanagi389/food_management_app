/**
 * データベーステーブルスキーマ定義
 * 全テーブルのCREATE文、ALTER文、DROP文を管理
 */
export class TableSchema {
  /**
   * 全テーブルのCREATE文を取得
   * @returns テーブル名とCREATE文のマップ
   */
  static getCreateStatements(): Record<string, string> {
    return {
      categories: `
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      
      ingredients: `
        CREATE TABLE IF NOT EXISTS ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category_id INTEGER NOT NULL,
          url TEXT,
          memo TEXT,
          price REAL,
          expiry_date TEXT,
          quantity INTEGER,
          weight REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        )
      `,
      
      recipes: `
        CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          ingredients TEXT,
          instructions TEXT,
          cooking_time INTEGER,
          servings INTEGER,
          difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      
      recipe_ingredients: `
        CREATE TABLE IF NOT EXISTS recipe_ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id INTEGER NOT NULL,
          ingredient_id INTEGER NOT NULL,
          quantity REAL,
          unit TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE,
          FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE,
          UNIQUE(recipe_id, ingredient_id)
        )
      `,
      
      health_records: `
        CREATE TABLE IF NOT EXISTS health_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          record_date TEXT NOT NULL,
          weight REAL,
          body_fat_percentage REAL,
          systolic_pressure INTEGER,
          diastolic_pressure INTEGER,
          exercise_duration INTEGER,
          sleep_duration REAL,
          water_intake INTEGER,
          calorie_intake INTEGER,
          memo TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
      
      user_profile: `
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          age INTEGER NOT NULL,
          gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
          height REAL NOT NULL,
          weight REAL NOT NULL,
          target_weight REAL,
          activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `
    }
  }

  /**
   * 特定のテーブルのCREATE文を取得
   * @param tableName テーブル名
   * @returns CREATE文またはnull
   */
  static getCreateStatement(tableName: string): string | null {
    const statements = this.getCreateStatements()
    return statements[tableName] || null
  }

  /**
   * 全テーブル名を取得
   */
  static getAllTableNames(): string[] {
    return Object.keys(this.getCreateStatements())
  }

  /**
   * スキーマ更新用のALTER文を取得
   */
  static getAlterStatements(): Record<string, string[]> {
    return {
      ingredients: [
        'ALTER TABLE ingredients ADD COLUMN url TEXT',
        'ALTER TABLE ingredients ADD COLUMN memo TEXT',
        'ALTER TABLE ingredients ADD COLUMN price REAL',
        'ALTER TABLE ingredients ADD COLUMN expiry_date TEXT',
        'ALTER TABLE ingredients ADD COLUMN quantity INTEGER',
        'ALTER TABLE ingredients ADD COLUMN weight REAL'
      ]
    }
  }

  /**
   * テーブル削除用のDROP文を取得
   */
  static getDropStatements(): Record<string, string> {
    const statements: Record<string, string> = {}
    const tableNames = this.getAllTableNames()
    
    // 外部キー制約があるため、削除順序を考慮
    const dropOrder = [
      'recipe_ingredients',
      'recipes', 
      'ingredients',
      'categories',
      'health_records',
      'user_profile'
    ]
    
    dropOrder.forEach(tableName => {
      statements[tableName] = `DROP TABLE IF EXISTS ${tableName}`
    })
    
    return statements
  }
}
