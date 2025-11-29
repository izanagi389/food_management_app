import { CapacitorSQLite } from '@capacitor-community/sqlite'
import type { UserProfile, DatabaseResult } from '~/types'
import { WebStorageManager } from './WebStorageManager'
import { BaseManager } from './BaseManager'

/**
 * プロファイル管理クラス
 */
export class ProfileManager extends BaseManager {
  constructor(databaseName: string, isWebPlatform: boolean, webStorageManager: WebStorageManager) {
    super(databaseName, isWebPlatform, webStorageManager)
  }

  /**
   * プロファイルを保存
   */
  async saveProfile(profile: UserProfile): Promise<DatabaseResult<UserProfile>> {
    try {
      this.addDebugLog(`プロファイルを保存中:${JSON.stringify(profile)}` )
      
      // Webプラットフォームの場合はWebストレージに保存
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージにプロファイルを保存します')
        
        const savedProfile: UserProfile = {
          ...profile,
          id: 1,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

          this.webStorageManager.saveUserProfile(savedProfile)
          
            return {
              success: true,
              message: 'プロファイルを保存しました（Webストレージ）',
          data: savedProfile
            }
            }
      
      // SQLiteでの保存処理
      return this.saveToSQLite(profile)
      
        } catch (error) {
      this.addDebugLog(`プロファイル保存エラー: ${error}`)
          return {
            success: false,
        message: `プロファイル保存エラー: ${error}`,
        data: undefined
      }
    }
  }

  /**
   * SQLiteへの保存
   */
  private async saveToSQLite(profile: UserProfile): Promise<DatabaseResult<UserProfile>> {
    try {
      // データベース接続確認
      await this.ensureDatabaseConnection()
      
      // 既存データを削除（プロファイルは1つのみ）- 空のデータも含めて完全削除
      this.addDebugLog('既存データを削除します（空のデータも含む）')
      const deleteResult = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: 'DELETE FROM user_profile',
        values: []
      })
      this.addDebugLog(`既存データ削除結果: ${JSON.stringify(deleteResult)}`)
      
      // 削除後、確実に空になっているか確認
      this.addDebugLog('削除後の確認: テーブル内のデータをチェックします')
      const checkResult = await CapacitorSQLite.query({
          database: this.getDatabaseName(),
        statement: 'SELECT COUNT(*) as count FROM user_profile',
          values: []
        })
      this.addDebugLog(`削除後のレコード数: ${JSON.stringify(checkResult)}`)
      
      // もしデータが残っている場合は強制削除
      if (checkResult && checkResult.values && checkResult.values.length > 0) {
        const count = checkResult.values[0].count || 0
        if (count > 0) {
          this.addDebugLog(`警告: ${count}件のデータが残っています。強制削除を実行します。`)
        await CapacitorSQLite.run({
          database: this.getDatabaseName(),
          statement: 'DELETE FROM user_profile',
          values: []
        })
        }
      }

      // AUTOINCREMENTシーケンスをリセット（IDを1から開始）
      this.addDebugLog('AUTOINCREMENTシーケンスをリセットします')
      const resetResult = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: "DELETE FROM sqlite_sequence WHERE name='user_profile'",
        values: []
      })
      this.addDebugLog(`シーケンスリセット結果: ${JSON.stringify(resetResult)}`)

      // テーブルが存在しない場合は作成
      this.addDebugLog('テーブル存在確認と作成を実行します')
      await this.ensureTableExists()

      // 現在の日時を取得
      const currentDate = new Date().toISOString()
      const created_at = profile.created_at || currentDate
      // 更新時は常に現在の日時を設定
      const updated_at = currentDate

      // 挿入する値を詳細にログ出力
      const insertValues = [
          profile.name || null,
          profile.age,
          profile.gender,
          profile.height,
          profile.weight,
          profile.target_weight || null,
          profile.activity_level || null,
            created_at,
            updated_at
          ]
      
      this.addDebugLog('=== データ挿入詳細 ===')
      this.addDebugLog(`挿入するname: "${profile.name}" -> "${insertValues[0]}"`)
      this.addDebugLog(`挿入するage: ${profile.age} (型: ${typeof profile.age}) -> ${insertValues[1]} (型: ${typeof insertValues[1]})`)
      this.addDebugLog(`挿入するgender: "${profile.gender}" -> "${insertValues[2]}"`)
      this.addDebugLog(`挿入するheight: ${profile.height} (型: ${typeof profile.height}) -> ${insertValues[3]} (型: ${typeof insertValues[3]})`)
      this.addDebugLog(`挿入するweight: ${profile.weight} (型: ${typeof profile.weight}) -> ${insertValues[4]} (型: ${typeof insertValues[4]})`)
      this.addDebugLog(`挿入するtarget_weight: ${profile.target_weight} -> ${insertValues[5]}`)
      this.addDebugLog(`挿入するactivity_level: ${profile.activity_level} -> ${insertValues[6]}`)
      
      // データ挿入
      const insertQuery = `
        INSERT INTO user_profile (name, age, gender, height, weight, target_weight, activity_level, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      this.addDebugLog(`実行するSQL: ${insertQuery}`)
      this.addDebugLog(`実行するVALUES: ${JSON.stringify(insertValues)}`)
      
      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: insertQuery,
        values: insertValues
      })

      this.addDebugLog(`プロファイル保存結果: ${JSON.stringify(response)}`)
      
      // 挿入結果の確認
      const insertSuccess = response && response.changes && response.changes.changes && response.changes.changes > 0
      const lastInsertId = response?.changes?.lastId
      
      // より詳細な挿入結果確認
      this.addDebugLog(`=== 挿入結果詳細確認 ===`)
      this.addDebugLog(`response.changes: ${JSON.stringify(response?.changes)}`)
      this.addDebugLog(`changes.count: ${response?.changes?.changes}`)
      this.addDebugLog(`lastInsertId: ${lastInsertId} (型: ${typeof lastInsertId})`)
      this.addDebugLog(`insertSuccess: ${insertSuccess}`)
      
      // lastInsertIdの妥当性をチェック
      if (lastInsertId !== undefined && lastInsertId !== null) {
        const idNumber = Number(lastInsertId)
        this.addDebugLog(`lastInsertId数値変換: ${idNumber} (isNaN: ${isNaN(idNumber)}, > 0: ${idNumber > 0})`)
      } else {
        this.addDebugLog('⚠️ 警告: lastInsertIdがundefinedまたはnullです')
      }
      
      if (!insertSuccess) {
        this.addDebugLog('⚠️ 警告: データ挿入が失敗したか、影響を受けた行数が0です')
        return {
          success: false,
          message: 'データ挿入に失敗しました',
          data: undefined
        }
      }

      // 少し待機してからデータを取得（SQLiteの同期のため）
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 挿入後のデータを取得 - lastInsertIdを使用した直接取得を試行
      this.addDebugLog(`挿入後のデータを取得します - lastInsertId: ${lastInsertId}`)
      
      // まず、テーブル内の全データを確認
      this.addDebugLog('テーブル内の全データを確認します')
      const allDataResult = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: 'SELECT * FROM user_profile ORDER BY id',
        values: []
      })
      this.addDebugLog(`テーブル内全データ: ${JSON.stringify(allDataResult)}`)
      
      let getResult = null
      
      // まず、lastInsertIdで直接取得を試行
      if (lastInsertId && lastInsertId > 0) {
        this.addDebugLog(`lastInsertId (${lastInsertId}) で直接取得を試行します`)
        getResult = await CapacitorSQLite.query({
          database: this.getDatabaseName(),
          statement: 'SELECT * FROM user_profile WHERE id = ?',
          values: [lastInsertId]
        })
        this.addDebugLog(`lastInsertIdでの取得結果: ${JSON.stringify(getResult)}`)
      }
      
      // 直接取得で失敗した場合、最新データを取得（有効なデータのみ）
      if (!getResult || !getResult.values || getResult.values.length === 0) {
        this.addDebugLog('直接取得失敗、有効な最新データを取得します')
        getResult = await CapacitorSQLite.query({
          database: this.getDatabaseName(),
          statement: `
            SELECT * FROM user_profile 
            WHERE id IS NOT NULL 
              AND id != "" 
              AND id > 0
              AND age IS NOT NULL 
              AND age > 0
              AND height IS NOT NULL 
              AND height > 0
              AND weight IS NOT NULL 
              AND weight > 0
              AND gender IS NOT NULL 
              AND gender != ""
            ORDER BY id DESC LIMIT 1
          `,
          values: []
        })
        this.addDebugLog(`有効データ取得結果: ${JSON.stringify(getResult)}`)
      }
        
      this.addDebugLog(`最終取得結果: ${JSON.stringify(getResult)}`)
      this.addDebugLog(`取得結果詳細: ${JSON.stringify({
          hasResult: !!getResult,
        hasValues: !!(getResult && getResult.values),
        valuesLength: getResult?.values?.length || 0,
        values: getResult?.values,
        lastInsertId: lastInsertId
        })}`)
      
      let savedData: UserProfile | null = null
        
        if (getResult && getResult.values && getResult.values.length > 0) {
        // 複数のデータがある場合、有効なデータを選択
        let rawData = null
        for (const data of getResult.values) {
          this.addDebugLog(`データ候補をチェック: ${JSON.stringify(data)}`)
          
          // データの有効性をチェック
          const isValidData = data.id && 
            data.id !== null && 
            data.id !== "" && 
            Number(data.id) > 0 &&
            data.age !== null && 
            data.age !== "" && 
            Number(data.age) > 0 &&
            data.height !== null && 
            data.height !== "" && 
            Number(data.height) > 0 &&
            data.weight !== null && 
            data.weight !== "" && 
            Number(data.weight) > 0 &&
            data.gender && 
            data.gender !== null && 
            data.gender !== ""
            
          this.addDebugLog(`データ有効性チェック結果: ${isValidData}`)
          
          if (isValidData) {
            rawData = data
            this.addDebugLog(`有効なデータを選択: ID=${data.id}`)
            break
          }
        }
        
        if (!rawData) {
          this.addDebugLog('⚠️ 警告: 有効なデータが見つかりませんでした')
        } else {
          this.addDebugLog(`選択された生データ: ${JSON.stringify(rawData)}`)
          this.addDebugLog(`生データの型: ${typeof rawData}`)
          this.addDebugLog(`生データのキー: ${JSON.stringify(Object.keys(rawData))}`)
          
          // 各フィールドの値を詳細にチェック
          this.addDebugLog('=== 取得データ詳細分析 ===')
          this.addDebugLog(`rawData.id: ${rawData.id} (型: ${typeof rawData.id})`)
          this.addDebugLog(`rawData.name: "${rawData.name}" (型: ${typeof rawData.name})`)
          this.addDebugLog(`rawData.age: ${rawData.age} (型: ${typeof rawData.age})`)
          this.addDebugLog(`rawData.gender: "${rawData.gender}" (型: ${typeof rawData.gender})`)
          this.addDebugLog(`rawData.height: ${rawData.height} (型: ${typeof rawData.height})`)
          this.addDebugLog(`rawData.weight: ${rawData.weight} (型: ${typeof rawData.weight})`)
          this.addDebugLog(`rawData.target_weight: ${rawData.target_weight} (型: ${typeof rawData.target_weight})`)
          this.addDebugLog(`rawData.activity_level: ${rawData.activity_level} (型: ${typeof rawData.activity_level})`)
          
          // 挿入したデータと取得したデータの比較
          this.addDebugLog('=== データ比較 ===')
          this.addDebugLog(`挿入したage: ${profile.age}, 取得したage: ${rawData.age}`)
          this.addDebugLog(`挿入したheight: ${profile.height}, 取得したheight: ${rawData.height}`)
          this.addDebugLog(`挿入したweight: ${profile.weight}, 取得したweight: ${rawData.weight}`)
          this.addDebugLog(`挿入したname: ${profile.name}, 取得したname: ${rawData.name}`)
          this.addDebugLog(`挿入したgender: ${profile.gender}, 取得したgender: ${rawData.gender}`)
          
          // iOS形式データの確認
          if (rawData.iosValues && rawData.iosColumns) {
            this.addDebugLog(`iOS形式データ: ${JSON.stringify({
              iosColumns: rawData.iosColumns,
              iosValues: rawData.iosValues
            })}`)
          }
          
          savedData = this.convertRawDataToProfile(rawData)
          
          this.addDebugLog(`変換後のデータ: ${JSON.stringify(savedData)}`)
          if (rawData) {
            this.addDebugLog(`変換前後の比較: ${JSON.stringify({
              変換前_age: rawData.age,
              変換後_age: savedData?.age,
              変換前_height: rawData.height,
              変換後_height: savedData?.height,
              変換前_weight: rawData.weight,
              変換後_weight: savedData?.weight
            })}`)
          }
        }
      } else {
        this.addDebugLog('⚠️ 警告: 挿入後にデータが取得できませんでした')
        
        // フォールバック: lastInsertIdを使用してデータを構築
        if (lastInsertId && lastInsertId > 0) {
          this.addDebugLog('フォールバック: lastInsertIdを使用してデータを構築します')
          savedData = {
            id: lastInsertId,
            name: profile.name || '',
            age: profile.age,
            gender: profile.gender,
            height: profile.height,
            weight: profile.weight,
            target_weight: profile.target_weight,
            activity_level: profile.activity_level,
            created_at: created_at,
            updated_at: updated_at
          }
          this.addDebugLog(`フォールバックデータ: ${JSON.stringify(savedData)}`)
        }
      }

      if (savedData && savedData.id && savedData.id > 0) {
        this.addDebugLog(`✅ プロファイル保存成功: ${JSON.stringify(savedData)}`)
        this.addDebugLog(`保存されたデータの詳細確認: ${JSON.stringify({
          id: savedData.id,
          name: savedData.name,
          age: savedData.age,
          gender: savedData.gender,
          height: savedData.height,
          weight: savedData.weight,
          target_weight: savedData.target_weight,
          activity_level: savedData.activity_level
        })}`)
        return {
          success: true,
          message: 'プロファイルを保存しました',
          data: savedData
        }
      } else {
        this.addDebugLog('❌ プロファイル保存失敗: savedDataが無効です')
        this.addDebugLog(`savedData: ${JSON.stringify(savedData)}`)
        this.addDebugLog(`savedData詳細: ${JSON.stringify({
          savedDataNull: savedData === null,
          savedDataUndefined: savedData === undefined,
          hasId: !!savedData?.id,
          idValue: savedData?.id,
          idType: typeof savedData?.id
        })}`)
        return {
          success: false,
          message: 'プロファイルの保存に失敗しました（データ取得エラー）',
          data: undefined
        }
      }
    } catch (error) {
      this.addDebugLog(`SQLite保存エラー: ${error}`)
      return {
        success: false,
        message: `SQLite保存エラー: ${error}`,
        data: undefined
      }
    }
  }

  /**
   * プロファイルを取得
   */
  async getProfile(): Promise<DatabaseResult<UserProfile | null>> {
    try {
      this.addDebugLog('プロファイルを取得中...')
      
      // Webプラットフォームの場合はWebストレージから取得
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージからプロファイルを取得します')
        
          const profile = this.webStorageManager.getUserProfile()
          
          if (profile) {
            return {
              success: true,
              message: 'プロファイルを取得しました',
              data: profile
            }
          } else {
      return {
        success: true,
              message: 'プロファイルが見つかりませんでした',
              data: null
            }
      }
      }

      // SQLiteでの取得処理
      return this.getFromSQLite()
      
    } catch (error) {
      this.addDebugLog(`プロファイル取得エラー: ${error}`)
      return {
        success: false,
        message: `プロファイル取得エラー: ${error}`,
            data: null
          }
        }
      }

  /**
   * SQLiteから取得
   */
  private async getFromSQLite(): Promise<DatabaseResult<UserProfile | null>> {
    try {
      // データベース接続確認
      await this.ensureDatabaseConnection()
      
      // テーブルが存在しない場合は作成
      await this.ensureTableExists()
      
      // テーブル存在確認（念のため）
      const tableExistsResult = await CapacitorSQLite.query({
          database: this.getDatabaseName(),
        statement: "SELECT name FROM sqlite_master WHERE type='table' AND name='user_profile'",
          values: []
        })
      
      const tableExists = tableExistsResult && tableExistsResult.values && tableExistsResult.values.length > 0
      
      if (!tableExists) {
        this.addDebugLog('⚠️ 警告: テーブル作成後もuser_profileテーブルが存在しません')
        return {
          success: true,
          message: 'プロファイルが見つかりませんでした（テーブル作成済み）',
          data: null
        }
      }

      // 最新のデータを取得（有効なデータのみ）
      const response = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: `
          SELECT * FROM user_profile 
          WHERE id IS NOT NULL 
            AND id != "" 
            AND id > 0
            AND age IS NOT NULL 
            AND age > 0
            AND height IS NOT NULL 
            AND height > 0
            AND weight IS NOT NULL 
            AND weight > 0
            AND gender IS NOT NULL 
            AND gender != ""
          ORDER BY id DESC LIMIT 1
        `,
        values: []
      })

      this.addDebugLog(`getFromSQLite取得結果: ${JSON.stringify(response)}`)

      if (response && response.values && response.values.length > 0) {
        // 複数のデータがある場合は有効なデータを選択
        let rawData = null
        for (const data of response.values) {
          this.addDebugLog(`getFromSQLiteデータ候補: ${JSON.stringify(data)}`)
          
          // データの有効性をチェック
          const isValidData = data.id && 
            data.id !== null && 
            data.id !== "" && 
            Number(data.id) > 0 &&
            data.age !== null && 
            data.age !== "" && 
            Number(data.age) > 0 &&
            data.height !== null && 
            data.height !== "" && 
            Number(data.height) > 0 &&
            data.weight !== null && 
            data.weight !== "" && 
            Number(data.weight) > 0 &&
            data.gender && 
            data.gender !== null && 
            data.gender !== ""
            
          if (isValidData) {
            rawData = data
            this.addDebugLog(`getFromSQLite有効なデータを選択: ID=${data.id}`)
            break
          }
        }
        
        if (!rawData) {
          this.addDebugLog('getFromSQLite: 有効なデータが見つかりませんでした')
          return {
            success: true,
            message: 'プロファイルが見つかりませんでした（無効なデータのみ）',
            data: null
          }
        } else {
          const profile = this.convertRawDataToProfile(rawData)
          
        return {
          success: true,
          message: 'プロファイルを取得しました',
          data: profile
          }
        }
      } else {
        return {
          success: true,
          message: 'プロファイルが見つかりませんでした',
          data: null
        }
      }
    } catch (error) {
      this.addDebugLog(`SQLite取得エラー: ${error}`)
      return {
        success: false,
        message: `SQLite取得エラー: ${error}`,
        data: null
      }
    }
  }

  /**
   * データベース接続確認
   */
  private async ensureDatabaseConnection(): Promise<void> {
    try {
      await CapacitorSQLite.createConnection({
        database: this.databaseName
      })
    } catch (error: any) {
      if (!error.message?.includes('already exists')) {
        throw error
      }
    }
  }

  /**
   * テーブル存在確認と作成
   */
  private async ensureTableExists(): Promise<void> {
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            height REAL NOT NULL,
            weight REAL NOT NULL,
            target_weight REAL,
            activity_level TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `
        
    this.addDebugLog(`テーブル作成SQL: ${createTableQuery}`)
    
    const createResult = await CapacitorSQLite.run({
          database: this.getDatabaseName(),
          statement: createTableQuery,
          values: []
        })
    
    this.addDebugLog(`テーブル作成結果: ${JSON.stringify(createResult)}`)
    
    // テーブル作成後に構造を確認
    const schemaResult = await CapacitorSQLite.query({
            database: this.getDatabaseName(),
      statement: "PRAGMA table_info(user_profile)",
            values: []
          })
    
    this.addDebugLog(`テーブル構造確認: ${JSON.stringify(schemaResult)}`)
  }

  /**
   * プロファイルを削除
   */
  async deleteProfile(): Promise<DatabaseResult<boolean>> {
    try {
      this.addDebugLog('プロファイルを削除中...')
      
      // Webプラットフォームの場合はWebストレージから削除
      if (this.isWeb()) {
        this.addDebugLog('Webプラットフォーム: Webストレージからプロファイルを削除します')
        
        this.webStorageManager.deleteUserProfile()
        
      return {
        success: true,
          message: 'プロファイルを削除しました（Webストレージ）'
        }
        }
      
      // SQLiteでの削除処理
      return this.deleteFromSQLite()
      
    } catch (error) {
      this.addDebugLog(`プロファイル削除エラー: ${error}`)
      return {
        success: false,
        message: `プロファイル削除エラー: ${error}`
      }
    }
  }

  /**
   * SQLiteから削除
   */
  private async deleteFromSQLite(): Promise<DatabaseResult<boolean>> {
    try {
      // データベース接続確認
      await this.ensureDatabaseConnection()

      const response = await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: 'DELETE FROM user_profile',
        values: []
      })

      this.addDebugLog(`プロファイル削除結果: ${JSON.stringify(response)}`)

      return {
        success: true,
        message: 'プロファイルを削除しました'
      }
    } catch (error) {
      this.addDebugLog(`SQLite削除エラー: ${error}`)
      return {
        success: false,
        message: `SQLite削除エラー: ${error}`
      }
    }
  }

  /**
   * データ変換
   */
  private convertRawDataToProfile(rawData: any): UserProfile {
    this.addDebugLog(`🔄 データ変換開始: ${JSON.stringify(rawData)}`)
    
    // iOSの場合、rawDataがiosColumns/iosValues形式の可能性がある
    let processedData = rawData
    
    // iOS形式データの処理
    if (rawData.iosValues && rawData.iosColumns) {
      this.addDebugLog('iOS形式データを検出しました')
      this.addDebugLog(`iosColumns: ${JSON.stringify(rawData.iosColumns)}`)
      this.addDebugLog(`iosValues: ${JSON.stringify(rawData.iosValues)}`)
      
      processedData = {}
      rawData.iosColumns.forEach((col: string, index: number) => {
        processedData[col] = rawData.iosValues[index]
      })
      this.addDebugLog(`処理後データ: ${JSON.stringify(processedData)}`)
    }
    
    // null/undefinedチェックを厳密に行い、0や空文字列も保持する
    const safeNumber = (value: any, defaultValue: number = 0): number => {
      if (value === null || value === undefined || value === '') return defaultValue
      const num = Number(value)
      return isNaN(num) ? defaultValue : num
    }
    
    const safeOptionalNumber = (value: any): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined
      const num = Number(value)
      return isNaN(num) ? undefined : num
    }
    
    const profile: UserProfile = {
      id: safeNumber(processedData.id, 1),
      name: processedData.name !== null && processedData.name !== undefined ? processedData.name : '',
      age: safeNumber(processedData.age, 0),
      gender: processedData.gender || 'male',
      height: safeNumber(processedData.height, 0),
      weight: safeNumber(processedData.weight, 0),
      target_weight: safeOptionalNumber(processedData.target_weight),
      activity_level: processedData.activity_level || undefined,
      created_at: processedData.created_at || new Date().toISOString(),
      updated_at: processedData.updated_at || new Date().toISOString()
    }
    
    this.addDebugLog(`🔄 変換完了: ${JSON.stringify(profile)}`)
    return profile
  }
}
