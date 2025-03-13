import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phone_number: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    is_locked: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String, default: "" },
    password_changed_at: { type: Date, required: true, default: () => new Date() },
    method: { type: String, enum: ["account", "google"], default: "account" },
    google_account_id: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
