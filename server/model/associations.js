import Recipient from "./recipientModels.js";
import RecordDocument from "./recordDocumentModels.js";
import DocumentAuditLogs from "./documentAuditModels.js";
import Office from "./officeModels.js";

Recipient.belongsTo(RecordDocument, {
  foreignKey: "document_id",
  as: "document",
});
RecordDocument.hasMany(Recipient, {
  foreignKey: "document_id",
  as: "recipients",
});

DocumentAuditLogs.belongsTo(RecordDocument, {
  foreignKey: "document_id",
  as: "document"
});

DocumentAuditLogs.belongsTo(Office, {
  foreignKey: "receiver",
  targetKey: "id",
  as: "office"
});

export { Recipient, RecordDocument, DocumentAuditLogs };