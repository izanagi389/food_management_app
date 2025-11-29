import type { HealthRecord, HealthStatistics, HealthGoal, BMIResult, DatabaseResult, CalorieCalculationInput, CalorieCalculationResult } from '~/types'
import { WebStorageManager } from './WebStorageManager'
import { CapacitorSQLite } from '@capacitor-community/sqlite'
import { BaseManager } from './BaseManager'

/**
 * 健康データ管理クラス
 */
export class HealthManager extends BaseManager {
  constructor(databaseName: string, isWebPlatform: boolean, webStorageManager: WebStorageManager) {
    super(databaseName, isWebPlatform, webStorageManager)
  }

  // ==================== 健康記録関連 ====================

  /**
   * 健康記録を追加
   */
  async insertHealthRecord(record: HealthRecord): Promise<DatabaseResult<HealthRecord>> {
    try {
      if (this.isWeb()) {
        return this.insertHealthRecordToWebStorage(record)
      }

      await CapacitorSQLite.createConnection({
        database: this.getDatabaseName(),
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false,
      })

      await CapacitorSQLite.open({ database: this.databaseName, readonly: false })

      const query = `
        INSERT INTO health_records (
          record_date, weight, body_fat_percentage,
          systolic_pressure, diastolic_pressure,
          exercise_duration, sleep_duration,
          water_intake, calorie_intake, memo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      const values = [
        record.record_date,
        record.weight || null,
        record.body_fat_percentage || null,
        record.systolic_pressure || null,
        record.diastolic_pressure || null,
        record.exercise_duration || null,
        record.sleep_duration || null,
        record.water_intake || null,
        record.calorie_intake || null,
        record.memo || null,
      ]

      await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: query,
        values: values
      })

      await CapacitorSQLite.close({ database: this.databaseName })

      return {
        success: true,
        message: '健康記録を追加しました',
      }
    } catch (error) {
      this.addDebugLog(`健康記録追加エラー: ${error}`)
      return {
        success: false,
        message: `健康記録追加エラー: ${error}`,
      }
    }
  }

  /**
   * Webストレージに健康記録を追加
   */
  private insertHealthRecordToWebStorage(record: HealthRecord): DatabaseResult<HealthRecord> {
    try {
      const records = this.webStorageManager.getHealthRecords()
      const newId = records.length > 0 ? Math.max(...records.map(r => r.id || 0)) + 1 : 1

      const newRecord: HealthRecord = {
        ...record,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      records.push(newRecord)
      this.webStorageManager.saveHealthRecords(records)

      return {
        success: true,
        message: '健康記録を追加しました（Webストレージ）',
        data: newRecord,
      }
    } catch (error) {
      this.addDebugLog(`Webストレージへの健康記録追加エラー: ${error}`)
      return {
        success: false,
        message: `Webストレージへの健康記録追加エラー: ${error}`,
      }
    }
  }

  /**
   * 全ての健康記録を取得
   */
  async getAllHealthRecords(): Promise<DatabaseResult<HealthRecord[]>> {
    try {
      if (this.isWeb()) {
        return this.getHealthRecordsFromWebStorage()
      }

      await CapacitorSQLite.createConnection({
        database: this.getDatabaseName(),
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false,
      })

      await CapacitorSQLite.open({ database: this.databaseName, readonly: false })

      const query = `
        SELECT * FROM health_records
        ORDER BY record_date DESC
      `

      const result = await CapacitorSQLite.query({
        database: this.getDatabaseName(),
        statement: query,
        values: []
      })

      await CapacitorSQLite.close({ database: this.databaseName })

      return {
        success: true,
        message: `健康記録を${result.values?.length || 0}件取得しました`,
        data: result.values || [],
      }
    } catch (error) {
      this.addDebugLog(`健康記録取得エラー: ${error}`)
      return {
        success: false,
        message: `健康記録取得エラー: ${error}`,
        data: [],
      }
    }
  }

  /**
   * Webストレージから健康記録を取得
   */
  private getHealthRecordsFromWebStorage(): DatabaseResult<HealthRecord[]> {
    try {
      const records = this.webStorageManager.getHealthRecords()
      // 日付順にソート（新しい順）
      records.sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime())

      return {
        success: true,
        message: `健康記録を${records.length}件取得しました（Webストレージ）`,
        data: records,
      }
    } catch (error) {
      this.addDebugLog(`Webストレージからの健康記録取得エラー: ${error}`)
      return {
        success: false,
        message: `Webストレージからの健康記録取得エラー: ${error}`,
        data: [],
      }
    }
  }

  /**
   * 健康記録を更新
   */
  async updateHealthRecord(id: number, record: Partial<HealthRecord>): Promise<DatabaseResult<void>> {
    try {
      if (this.isWeb()) {
        return this.updateHealthRecordInWebStorage(id, record)
      }

      await CapacitorSQLite.createConnection({
        database: this.getDatabaseName(),
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false,
      })

      await CapacitorSQLite.open({ database: this.databaseName, readonly: false })

      const setFields: string[] = []
      const values: any[] = []

      if (record.record_date !== undefined) {
        setFields.push('record_date = ?')
        values.push(record.record_date)
      }
      if (record.weight !== undefined) {
        setFields.push('weight = ?')
        values.push(record.weight)
      }
      if (record.body_fat_percentage !== undefined) {
        setFields.push('body_fat_percentage = ?')
        values.push(record.body_fat_percentage)
      }
      if (record.systolic_pressure !== undefined) {
        setFields.push('systolic_pressure = ?')
        values.push(record.systolic_pressure)
      }
      if (record.diastolic_pressure !== undefined) {
        setFields.push('diastolic_pressure = ?')
        values.push(record.diastolic_pressure)
      }
      if (record.exercise_duration !== undefined) {
        setFields.push('exercise_duration = ?')
        values.push(record.exercise_duration)
      }
      if (record.sleep_duration !== undefined) {
        setFields.push('sleep_duration = ?')
        values.push(record.sleep_duration)
      }
      if (record.water_intake !== undefined) {
        setFields.push('water_intake = ?')
        values.push(record.water_intake)
      }
      if (record.calorie_intake !== undefined) {
        setFields.push('calorie_intake = ?')
        values.push(record.calorie_intake)
      }
      if (record.memo !== undefined) {
        setFields.push('memo = ?')
        values.push(record.memo)
      }

      setFields.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      const query = `
        UPDATE health_records
        SET ${setFields.join(', ')}
        WHERE id = ?
      `

      await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: query,
        values: values
      })
      await CapacitorSQLite.close({ database: this.databaseName })

      return {
        success: true,
        message: '健康記録を更新しました',
      }
    } catch (error) {
      this.addDebugLog(`健康記録更新エラー: ${error}`)
      return {
        success: false,
        message: `健康記録更新エラー: ${error}`,
      }
    }
  }

  /**
   * Webストレージの健康記録を更新
   */
  private updateHealthRecordInWebStorage(id: number, record: Partial<HealthRecord>): DatabaseResult<void> {
    try {
      const records = this.webStorageManager.getHealthRecords()
      const index = records.findIndex((r: HealthRecord) => r.id === id)

      if (index === -1) {
        return {
          success: false,
          message: '健康記録が見つかりません',
        }
      }

      const currentRecord = records[index]
      if (!currentRecord) {
        return {
          success: false,
          message: '健康記録が見つかりません',
        }
      }

      records[index] = {
        ...currentRecord,
        ...record,
        record_date: record.record_date || currentRecord.record_date,
        updated_at: new Date().toISOString(),
      }

      this.webStorageManager.saveHealthRecords(records)

      return {
        success: true,
        message: '健康記録を更新しました（Webストレージ）',
      }
    } catch (error) {
      this.addDebugLog(`Webストレージの健康記録更新エラー: ${error}`)
      return {
        success: false,
        message: `Webストレージの健康記録更新エラー: ${error}`,
      }
    }
  }

  /**
   * 健康記録を削除
   */
  async deleteHealthRecord(id: number): Promise<DatabaseResult<void>> {
    try {
      if (this.isWeb()) {
        return this.deleteHealthRecordFromWebStorage(id)
      }

      await CapacitorSQLite.createConnection({
        database: this.getDatabaseName(),
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false,
      })

      await CapacitorSQLite.open({ database: this.databaseName, readonly: false })

      const query = 'DELETE FROM health_records WHERE id = ?'
      await CapacitorSQLite.run({
        database: this.getDatabaseName(),
        statement: query,
        values: [id]
      })

      await CapacitorSQLite.close({ database: this.databaseName })

      return {
        success: true,
        message: '健康記録を削除しました',
      }
    } catch (error) {
      this.addDebugLog(`健康記録削除エラー: ${error}`)
      return {
        success: false,
        message: `健康記録削除エラー: ${error}`,
      }
    }
  }

  /**
   * Webストレージから健康記録を削除
   */
  private deleteHealthRecordFromWebStorage(id: number): DatabaseResult<void> {
    try {
      const records = this.webStorageManager.getHealthRecords()
      const filteredRecords = records.filter((r: HealthRecord) => r.id !== id)

      if (records.length === filteredRecords.length) {
        return {
          success: false,
          message: '健康記録が見つかりません',
        }
      }

      this.webStorageManager.saveHealthRecords(filteredRecords)

      return {
        success: true,
        message: '健康記録を削除しました（Webストレージ）',
      }
    } catch (error) {
      this.addDebugLog(`Webストレージからの健康記録削除エラー: ${error}`)
      return {
        success: false,
        message: `Webストレージからの健康記録削除エラー: ${error}`,
      }
    }
  }

  // ==================== BMI計算 ====================

  /**
   * BMIを計算
   * @param weight 体重 (kg)
   * @param height 身長 (cm)
   */
  calculateBMI(weight: number, height: number): BMIResult {
    // 身長をメートルに変換
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)

    let category: BMIResult['category']
    let categoryLabel: string

    if (bmi < 18.5) {
      category = 'underweight'
      categoryLabel = '低体重'
    } else if (bmi < 25) {
      category = 'normal'
      categoryLabel = '普通体重'
    } else if (bmi < 30) {
      category = 'overweight'
      categoryLabel = '肥満（1度）'
    } else {
      category = 'obese'
      categoryLabel = '肥満（2度以上）'
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      category,
      categoryLabel,
    }
  }

  // ==================== カロリー計算 ====================

  /**
   * 必要カロリーを計算（ハリス・ベネディクト方程式を使用）
   * @param input 年齢、性別、体重、身長
   */
  calculateCalories(input: CalorieCalculationInput): CalorieCalculationResult {
    const { age, gender, weight, height } = input

    // 基礎代謝量（BMR）を計算
    let bmr: number
    if (gender === 'male') {
      // 男性: BMR = 88.362 + (13.397 × 体重kg) + (4.799 × 身長cm) - (5.677 × 年齢)
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    } else {
      // 女性: BMR = 447.593 + (9.247 × 体重kg) + (3.098 × 身長cm) - (4.330 × 年齢)
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    }

    // 活動レベル別の必要カロリーを計算
    const sedentary = bmr * 1.2      // ほとんど運動しない
    const light = bmr * 1.375         // 軽い運動（週1-3日）
    const moderate = bmr * 1.55       // 中程度の運動（週3-5日）
    const active = bmr * 1.725        // 激しい運動（週6-7日）
    const veryActive = bmr * 1.9      // 非常に激しい運動（1日2回など）

    return {
      bmr: Math.round(bmr),
      sedentary: Math.round(sedentary),
      light: Math.round(light),
      moderate: Math.round(moderate),
      active: Math.round(active),
      veryActive: Math.round(veryActive),
    }
  }

  // ==================== 統計データ ====================

  /**
   * 健康統計データを取得
   */
  async getHealthStatistics(dateFrom?: string, dateTo?: string): Promise<DatabaseResult<HealthStatistics>> {
    try {
      const recordsResult = await this.getAllHealthRecords()

      if (!recordsResult.success || !recordsResult.data) {
        return {
          success: false,
          message: '健康記録の取得に失敗しました',
        }
      }

      let records = recordsResult.data

      // 日付フィルタリング
      if (dateFrom || dateTo) {
        records = records.filter((record: HealthRecord) => {
          const recordDate = new Date(record.record_date)
          if (dateFrom && recordDate < new Date(dateFrom)) return false
          if (dateTo && recordDate > new Date(dateTo)) return false
          return true
        })
      }

      if (records.length === 0) {
        return {
          success: true,
          message: '統計データがありません',
          data: {
            recordCount: 0,
            dateRange: {
              from: dateFrom || '',
              to: dateTo || '',
            },
          },
        }
      }

      // 統計を計算
      const weights = records.filter((r: HealthRecord) => r.weight).map((r: HealthRecord) => r.weight!)
      const bodyFats = records.filter((r: HealthRecord) => r.body_fat_percentage).map((r: HealthRecord) => r.body_fat_percentage!)
      const systolicPressures = records.filter((r: HealthRecord) => r.systolic_pressure).map((r: HealthRecord) => r.systolic_pressure!)
      const diastolicPressures = records.filter((r: HealthRecord) => r.diastolic_pressure).map((r: HealthRecord) => r.diastolic_pressure!)
      const exerciseDurations = records.filter((r: HealthRecord) => r.exercise_duration).map((r: HealthRecord) => r.exercise_duration!)
      const sleepDurations = records.filter((r: HealthRecord) => r.sleep_duration).map((r: HealthRecord) => r.sleep_duration!)
      const waterIntakes = records.filter((r: HealthRecord) => r.water_intake).map((r: HealthRecord) => r.water_intake!)
      const calorieIntakes = records.filter((r: HealthRecord) => r.calorie_intake).map((r: HealthRecord) => r.calorie_intake!)

      const firstRecord = records[0]
      const lastRecord = records[records.length - 1]

      const statistics: HealthStatistics = {
        recordCount: records.length,
        dateRange: {
          from: lastRecord?.record_date || '',
          to: firstRecord?.record_date || '',
        },
      }

      if (weights.length > 0) {
        const firstWeight = weights[0]
        const lastWeight = weights[weights.length - 1]
        statistics.averageWeight = Math.round((weights.reduce((a: number, b: number) => a + b, 0) / weights.length) * 10) / 10
        statistics.latestWeight = firstWeight
        if (firstWeight !== undefined && lastWeight !== undefined) {
          statistics.weightChange = Math.round((firstWeight - lastWeight) * 10) / 10
        }
      }

      if (bodyFats.length > 0) {
        statistics.averageBodyFat = Math.round((bodyFats.reduce((a: number, b: number) => a + b, 0) / bodyFats.length) * 10) / 10
        statistics.latestBodyFat = bodyFats[0]
      }

      if (systolicPressures.length > 0) {
        statistics.averageSystolicPressure = Math.round(systolicPressures.reduce((a: number, b: number) => a + b, 0) / systolicPressures.length)
      }

      if (diastolicPressures.length > 0) {
        statistics.averageDiastolicPressure = Math.round(diastolicPressures.reduce((a: number, b: number) => a + b, 0) / diastolicPressures.length)
      }

      if (exerciseDurations.length > 0) {
        const totalExercise = exerciseDurations.reduce((a: number, b: number) => a + b, 0)
        statistics.totalExerciseDuration = totalExercise
        statistics.averageExerciseDuration = Math.round(totalExercise / exerciseDurations.length)
      }

      if (sleepDurations.length > 0) {
        statistics.averageSleepDuration = Math.round((sleepDurations.reduce((a: number, b: number) => a + b, 0) / sleepDurations.length) * 10) / 10
      }

      if (waterIntakes.length > 0) {
        statistics.averageWaterIntake = Math.round(waterIntakes.reduce((a: number, b: number) => a + b, 0) / waterIntakes.length)
      }

      if (calorieIntakes.length > 0) {
        statistics.averageCalorieIntake = Math.round(calorieIntakes.reduce((a: number, b: number) => a + b, 0) / calorieIntakes.length)
      }

      return {
        success: true,
        message: '統計データを取得しました',
        data: statistics,
      }
    } catch (error) {
      this.addDebugLog(`統計データ取得エラー: ${error}`)
      return {
        success: false,
        message: `統計データ取得エラー: ${error}`,
      }
    }
  }
}

