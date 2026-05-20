declare module '../../services/api' {
  export const ordersAPI: {
    getAll: (params?: any) => Promise<any>;
    updateStatus: (id: string, data: any) => Promise<any>;
  };
  export const paymentsAPI: {
    approve: (id: string, data: any) => Promise<any>;
    reject: (id: string, data: any) => Promise<any>;
  };
}
