# Headlamp Longhorn Plugin

This plugin integrates [Longhorn](https://longhorn.io/), a cloud-native distributed block storage system for Kubernetes, into the [Headlamp](https://headlamp.dev/) UI. It provides visibility into your Longhorn storage resources directly within Headlamp.

## Overview

Longhorn provides persistent storage for Kubernetes workloads, but managing and monitoring its components (Volumes, Nodes, Backups, etc.) often requires using the separate Longhorn UI or `kubectl`. This Headlamp plugin aims to bring essential Longhorn resource details and status directly into your primary Kubernetes dashboard, streamlining storage management workflows.

## Features

This plugin currently supports viewing the following Longhorn resources:

*   **Volumes:** List view and detailed view showing status, configuration, Kubernetes PV/PVC links, and conditions.
*   **Nodes:** List view and detailed view displaying status (Ready, Schedulable), configuration, attached disk details (including status and specs in a table), and conditions.
*   **Settings:** A grouped view (categorized based on Longhorn documentation) displaying current setting values and their applied status.
*   **Backups:** List view and detailed view showing state, snapshot info, target, size, timestamps, labels, and error messages.
*   **Engine Images:** List view and detailed view displaying state, image reference, version details, node deployment status, and conditions.

## Prerequisites

*   **Headlamp:** You need a running instance of Headlamp (either the desktop app or deployed in-cluster).
*   **Longhorn:** Longhorn must be installed and running in the Kubernetes cluster that Headlamp is connected to.

## Installation

### Desktop App (Recommended)

1.  Navigate to the "Plugins" section in Headlamp.
2.  Find the "Longhorn" plugin in the catalog. *(Note: This assumes the plugin is published to a catalog Headlamp uses)*.
3.  Click "Install".
4.  Reload Headlamp when prompted.

### Desktop App (Manual)

1.  [Build the plugin](./DEVELOPMENT.md#building-for-production) to get the `main.js` file (and potentially other assets in the `dist` directory).
2.  Create the plugin directory structure:
    *   **Linux:** `~/.config/Headlamp/plugins/headlamp-longhorn/`
    *   **macOS:** `~/Library/Application Support/Headlamp/plugins/headlamp-longhorn/`
    *   **Windows:** `%APPDATA%\Headlamp\config\plugins\headlamp-longhorn\`
3.  Copy the contents of the plugin's `dist` folder (including `main.js`) and the `package.json` file into the `headlamp-longhorn` directory created above.
4.  Restart Headlamp.

### In-Cluster Deployment

To use this plugin in an in-cluster Headlamp deployment (when using the official Headlamp image), you need an initContainer to copy the plugin files into a shared volume mounted by the main Headlamp container.

If you followed the steps in "Advanced: Building a Plugin-Files Image" below, you can use your built image. Modify your Headlamp Helm `values.yaml` or Deployment manifest:

```yaml
# Example using Helm values.yaml
# Add this under the main 'headlamp' deployment configuration

initContainers:
  - name: init-longhorn-plugin # Changed name slightly
    # Use the image containing your built plugin files
    # Ensure this image name matches the one you built/is built by CI
    image: ghcr.io/giantswarm/headlamp-longhorn:latest 
    imagePullPolicy: Always
    command:
      - /bin/sh
      - -c
      - |
        echo "Copying Longhorn plugin..."
        # The target directory name MUST match how Headlamp expects to find the plugin
        PLUGIN_TARGET_DIR="/headlamp/plugins/headlamp-longhorn"
        mkdir -p "$PLUGIN_TARGET_DIR"
        # Adjust source path inside the plugin image if necessary (should be /plugins/headlamp-longhorn based on Dockerfile)
        cp -r /plugins/headlamp-longhorn/* "$PLUGIN_TARGET_DIR/"
        echo "Longhorn plugin copied."
    volumeMounts:
      - name: plugins # Must match the volume name used by the main Headlamp container
        mountPath: /headlamp/plugins

# Ensure the corresponding volumeMount is also present in the main Headlamp container
# spec:
#   template:
#     spec:
#       containers:
#       - name: headlamp
#         image: ghcr.io/headlamp-k8s/headlamp:latest # Official Headlamp image
#         volumeMounts:
#         - name: plugins
#           mountPath: /headlamp/plugins
#         # ... other headlamp container config ...
#       volumes:
#       - name: plugins
#         emptyDir: {}
```

## Usage

Once installed and Headlamp is connected to a cluster with Longhorn running:

1.  Look for the **Longhorn** entry in the main sidebar menu on the left.
2.  Click on it to expand the sub-menu containing Volumes, Nodes, Settings, Backups, and Engine Images.
3.  Navigate through the different list and detail views.

## Advanced: Building a Plugin-Files Image

Instead of installing the plugin manually, you can build a container image that contains just the necessary files for this plugin (`dist/` directory and `package.json`). This image can then be used with an initContainer (as shown in the In-Cluster Deployment section) to copy the plugin into your main Headlamp deployment.

1.  **Create a Dockerfile:** Place the following `Dockerfile` in the root of the `headlamp-longhorn` plugin directory:

    ```dockerfile
    # Dockerfile
    # Stage 1: Build the headlamp-longhorn plugin
    FROM node:20-alpine as builder

    # Set the working directory
    WORKDIR /plugin

    # Copy package files and install dependencies
    COPY package*.json ./
    RUN npm install

    # Copy the rest of the plugin source code
    COPY . .

    # Build the plugin using the headlamp-plugin tool
    # This creates the necessary files in the /plugin/dist directory
    RUN npm run build

    # Stage 2: Create the final image containing only the built plugin artifacts
    FROM alpine:latest

    # Create the directory structure expected by Headlamp (/plugins/<plugin-folder-name>)
    # Using 'headlamp-longhorn' as the folder name based on repo/directory structure
    RUN mkdir -p /plugins/headlamp-longhorn

    # Copy the built plugin files (dist/) and package.json from the builder stage
    COPY --from=builder /plugin/dist/ /plugins/headlamp-longhorn/
    COPY --from=builder /plugin/package.json /plugins/headlamp-longhorn/

    # Optional: Set permissions if needed, though typically handled by volume mounts/Headlamp itself
    # RUN chown -R <someuser>:<somegroup> /plugins

    # No CMD or ENTRYPOINT needed, this image just holds files.
    ```

2.  **Build the image:** Run this command from the root of the `headlamp-longhorn` plugin directory:

    ```bash
    # Build the image containing only the plugin files
    docker build -t ghcr.io/giantswarm/headlamp-longhorn:my-tag .
    ```
    (Replace `my-tag` with your desired image tag, e.g., `latest` or a version number).

3.  **Push the image:** (If needed for your cluster)
    ```bash
    # Push the image containing only the plugin files
    docker push ghcr.io/giantswarm/headlamp-longhorn:my-tag
    ```

This image can now be referenced in an initContainer as shown in the In-Cluster Deployment section.

**Note:** An image containing just the plugin files is automatically built and pushed to `ghcr.io/giantswarm/headlamp-longhorn` by a [GitHub Actions workflow](.github/workflows/ci.yml) whenever changes are pushed to the `main` branch or a version tag (e.g., `v1.x.x`) is created.

## Development

To run this plugin locally during development:

1.  Clone the repository.
2.  Navigate to the plugin directory (`cd headlamp-longhorn`).
3.  Install dependencies: `npm install`
4.  Start the development server: `npm run start`
5.  Ensure Headlamp (desktop app recommended for development) is running and configured to load plugins from the appropriate directory or that you manually copy the built files to its plugin directory.

## Contributing / Feedback

Encountered a bug or have a feature request? Please file an issue on the [GitHub repository](https://github.com/giantswarm/headlamp-longhorn).
