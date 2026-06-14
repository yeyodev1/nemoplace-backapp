import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.DB_URI;

async function run() {
  if (!uri) throw new Error("DB_URI is not defined");
  await mongoose.connect(uri);

  const WorkspaceSchema = new mongoose.Schema({
    name: String,
    ghl: {
      locationId: String,
      apiKey: String,
    }
  });

  const Workspace = mongoose.model("workspaces", WorkspaceSchema);

  // We will find the first workspace (or Diego's Workspace)
  let workspace = await Workspace.findOne();
  if (!workspace) {
    console.log("No workspace found to update.");
    process.exit(1);
  }

  // Update with the provided credentials
  workspace.ghl = {
    locationId: "ntPHdjfB5Ip2QRxy9lRl",
    apiKey: "pit-2b4c3b1e-9f51-4ee2-a3bc-1c2c48944245"
  };

  await workspace.save();

  console.log(`Successfully updated Workspace (${workspace._id}) with GHL credentials!`);
  process.exit(0);
}

run();
