/**
 * Ionic コンポーネントの共通インポート
 */
export const useIonicComponents = () => {
  return {
    // Core components
    IonPage: () => import('@ionic/vue').then(m => m.IonPage),
    IonHeader: () => import('@ionic/vue').then(m => m.IonHeader),
    IonToolbar: () => import('@ionic/vue').then(m => m.IonToolbar),
    IonTitle: () => import('@ionic/vue').then(m => m.IonTitle),
    IonContent: () => import('@ionic/vue').then(m => m.IonContent),
    IonButtons: () => import('@ionic/vue').then(m => m.IonButtons),
    IonButton: () => import('@ionic/vue').then(m => m.IonButton),
    IonBackButton: () => import('@ionic/vue').then(m => m.IonBackButton),
    
    // Card components
    IonCard: () => import('@ionic/vue').then(m => m.IonCard),
    IonCardHeader: () => import('@ionic/vue').then(m => m.IonCardHeader),
    IonCardTitle: () => import('@ionic/vue').then(m => m.IonCardTitle),
    IonCardContent: () => import('@ionic/vue').then(m => m.IonCardContent),
    
    // List components
    IonList: () => import('@ionic/vue').then(m => m.IonList),
    IonItem: () => import('@ionic/vue').then(m => m.IonItem),
    IonLabel: () => import('@ionic/vue').then(m => m.IonLabel),
    
    // Form components
    IonInput: () => import('@ionic/vue').then(m => m.IonInput),
    IonTextarea: () => import('@ionic/vue').then(m => m.IonTextarea),
    IonSelect: () => import('@ionic/vue').then(m => m.IonSelect),
    IonSelectOption: () => import('@ionic/vue').then(m => m.IonSelectOption),
    IonDatetime: () => import('@ionic/vue').then(m => m.IonDatetime),
    
    // Modal and overlay
    IonModal: () => import('@ionic/vue').then(m => m.IonModal),
    
    // UI elements
    IonIcon: () => import('@ionic/vue').then(m => m.IonIcon),
    IonChip: () => import('@ionic/vue').then(m => m.IonChip),
    IonApp: () => import('@ionic/vue').then(m => m.IonApp)
  }
}

/**
 * よく使用されるIonicアイコンの共通インポート
 */
export const useIonicIcons = () => {
  return {
    // Navigation icons
    homeOutline: () => import('ionicons/icons').then(m => m.homeOutline),
    arrowBackOutline: () => import('ionicons/icons').then(m => m.arrowBackOutline),
    
    // Action icons
    addOutline: () => import('ionicons/icons').then(m => m.addOutline),
    createOutline: () => import('ionicons/icons').then(m => m.createOutline),
    saveOutline: () => import('ionicons/icons').then(m => m.saveOutline),
    trashOutline: () => import('ionicons/icons').then(m => m.trashOutline),
    closeOutline: () => import('ionicons/icons').then(m => m.closeOutline),
    refreshOutline: () => import('ionicons/icons').then(m => m.refreshOutline),
    
    // Content icons
    restaurantOutline: () => import('ionicons/icons').then(m => m.restaurantOutline),
    listOutline: () => import('ionicons/icons').then(m => m.listOutline),
    bookOutline: () => import('ionicons/icons').then(m => m.bookOutline),
    linkOutline: () => import('ionicons/icons').then(m => m.linkOutline),
    timeOutline: () => import('ionicons/icons').then(m => m.timeOutline),
    peopleOutline: () => import('ionicons/icons').then(m => m.peopleOutline),
    starOutline: () => import('ionicons/icons').then(m => m.starOutline),
    pricetag: () => import('ionicons/icons').then(m => m.pricetag),
    
    // Status icons
    checkmarkCircle: () => import('ionicons/icons').then(m => m.checkmarkCircle),
    closeCircle: () => import('ionicons/icons').then(m => m.closeCircle),
    informationCircleOutline: () => import('ionicons/icons').then(m => m.informationCircleOutline),
    addCircleOutline: () => import('ionicons/icons').then(m => m.addCircleOutline)
  }
}
