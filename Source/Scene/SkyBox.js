/*global define*/
define([
        '../Core/BoxTessellator',
        '../Core/Cartesian3',
        '../Core/destroyObject',
        '../Core/DeveloperError',
        '../Core/JulianDate',
        '../Core/Matrix4',
        '../Core/MeshFilters',
        '../Core/PrimitiveType',
        '../Core/TimeStandard',
        '../Core/Transforms',
        '../Renderer/loadCubeMap',
        '../Renderer/BufferUsage',
        '../Renderer/DrawCommand',
        '../Scene/SceneMode',
        '../Shaders/SkyBoxVS',
        '../Shaders/SkyBoxFS'
    ], function(
        BoxTessellator,
        Cartesian3,
        destroyObject,
        DeveloperError,
        JulianDate,
        Matrix4,
        MeshFilters,
        PrimitiveType,
        TimeStandard,
        Transforms,
        loadCubeMap,
        BufferUsage,
        DrawCommand,
        SceneMode,
        SkyBoxVS,
        SkyBoxFS) {
    "use strict";

    /**
     * DOC_TBA
     *
     * @alias SkyBox
     * @constructor
     *
     * @exception {DeveloperError} cubeMapUrls is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.
     */
    var SkyBox = function(cubeMapUrls) {
        if ((typeof cubeMapUrls === 'undefined') ||
            (typeof cubeMapUrls.positiveX === 'undefined') ||
            (typeof cubeMapUrls.negativeX === 'undefined') ||
            (typeof cubeMapUrls.positiveY === 'undefined') ||
            (typeof cubeMapUrls.negativeY === 'undefined') ||
            (typeof cubeMapUrls.positiveZ === 'undefined') ||
            (typeof cubeMapUrls.negativeZ === 'undefined')) {
            throw new DeveloperError('cubeMapUrls is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.');
        }

        this._command = new DrawCommand();
        this._cubeMap = undefined;
        this._cubeMapUrls = cubeMapUrls;
    };

    /**
     * @private
     */
    SkyBox.prototype.update = function(context, frameState) {
        // TODO: Only supports 3D, add Columbus view support.
        if (frameState.mode !== SceneMode.SCENE3D) {
            return undefined;
        }

        // The sky box is only rendered during the color pass; it is not pickable, it doesn't cast shadows, etc.
        if (!frameState.passes.color) {
            return undefined;
        }

        var command = this._command;

        if (typeof command.vertexArray === 'undefined') {
            var that = this;

            loadCubeMap(context, this._cubeMapUrls).then(function(cubeMap) {
                that._cubeMap = cubeMap;

                command.uniformMap = {
                    u_cubeMap: function() {
                        return cubeMap;
                    }
                };
            });

            var mesh = BoxTessellator.compute({
                dimensions : new Cartesian3(2.0, 2.0, 2.0)
            });
            var attributeIndices = MeshFilters.createAttributeIndices(mesh);

            command.primitiveType = PrimitiveType.TRIANGLES;
            command.vertexArray = context.createVertexArrayFromMesh({
                mesh: mesh,
                attributeIndices: attributeIndices,
                bufferUsage: BufferUsage.STATIC_DRAW
            });
            command.shaderProgram = context.getShaderCache().getShaderProgram(SkyBoxVS, SkyBoxFS, attributeIndices);
            command.renderState = context.createRenderState();
        }

        if (typeof this._cubeMap === 'undefined') {
            return undefined;
        }

        // TODO: Use scene time
        var time = JulianDate.fromDate(new Date(), TimeStandard.UTC);
        command.modelMatrix = Matrix4.fromRotationTranslation(Transforms.computeTemeToPseudoFixedMatrix(time), Cartesian3.ZERO);
        return command;
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     *
     * @memberof SkyBox
     *
     * @return {Boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
     *
     * @see SkyBox#destroy
     */
    SkyBox.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     *
     * @memberof SkyBox
     *
     * @return {undefined}
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @see SkyBox#isDestroyed
     *
     * @example
     * skyBox = skyBox && skyBox.destroy();
     */
    SkyBox.prototype.destroy = function() {
        var command = this._command;
        command.vertexArray = command.vertexArray && command.vertexArray.destroy();
        command.shaderProgram = command.shaderProgram && command.shaderProgram.release();
        this._cubeMap = this._cubeMap && this._cubeMap.destroy();
        return destroyObject(this);
    };

    return SkyBox;
});