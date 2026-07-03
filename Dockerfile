# The plugin bundle is built by the CircleCI node-build job (npm run ci:build)
# and handed to this image build through the CircleCI workspace: dist/ is
# expected to exist in the build context. This image only holds files -- no
# CMD or ENTRYPOINT.
FROM alpine:3.24

ARG PLUGIN_NAME=headlamp-longhorn

# Headlamp expects /plugins/<plugin-folder-name>/main.js + package.json.
COPY dist/ /plugins/${PLUGIN_NAME}/
COPY package.json /plugins/${PLUGIN_NAME}/
