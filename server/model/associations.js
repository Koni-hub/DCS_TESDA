import Recipient from "./recipientModels.js";
import RecordDocument from "./recordDocumentModels.js";
import DocumentAuditLogs from "./documentAuditModels.js";

// Define associations
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

export { Recipient, RecordDocument, DocumentAuditLogs };