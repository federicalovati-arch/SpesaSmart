export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
  };
  
  export class FirestorePermissionError extends Error {
    context: SecurityRuleContext;
  
    constructor(context: SecurityRuleContext) {
      const deniedMessage = `Firestore Security Rules DENIED access to ${context.operation} on ${context.path}`;
      super(deniedMessage);
      this.name = 'FirestorePermissionError';
      this.context = context;
  
      Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
  }
  