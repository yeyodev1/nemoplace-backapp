import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const uri = "mongodb+srv://dreyes_db_user:lUlv5nL5PfR7xltc@production.kvgnbgf.mongodb.net/?appName=production";

async function run() {
  await mongoose.connect(uri);

  const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    status: String,
    workspaceId: mongoose.Schema.Types.ObjectId,
  });

  const WorkspaceSchema = new mongoose.Schema({
    name: String,
  });

  const User = mongoose.model("users", UserSchema);
  const Workspace = mongoose.model("workspaces", WorkspaceSchema);

  const email = "dreyes@bakano.ec";

  // Check if exists
  let exists = await User.findOne({ email });
  if (exists) {
    console.log("User already exists! Updating password...");
    const salt = await bcrypt.genSalt(10);
    exists.password = await bcrypt.hash("123456789", salt);
    await exists.save();
    console.log("Password updated successfully!");
    process.exit(0);
  }

  const workspace = await Workspace.create({ name: "Diego's Workspace" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("123456789", salt);

  await User.create({
    name: "Diego Reyes",
    email,
    password: hashedPassword,
    role: "Owner",
    status: "Activo",
    workspaceId: workspace._id,
  });

  console.log("Account created successfully!");
  process.exit(0);
}

run();
