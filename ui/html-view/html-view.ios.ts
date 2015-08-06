﻿import common = require("ui/html-view/html-view-common");
import definition = require("ui/html-view");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import utils = require("utils/utils");
import types = require("utils/types");
import viewModule = require("ui/core/view");

function onHtmlPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <HtmlView>data.object;
    if (!view.ios) {
        return;
    }

    if (types.isString(data.newValue)) {
        var htmlString = NSString.stringWithString(data.newValue);
        var nsData = htmlString.dataUsingEncoding(NSUnicodeStringEncoding);
        view.ios.attributedText = NSAttributedString.alloc().initWithDataOptionsDocumentAttributesError(nsData, <any>{ [NSDocumentTypeDocumentAttribute]: NSHTMLTextDocumentType }, null);
    } else {
        view.ios.attributedText = NSAttributedString.new();
    }
}

// register the setNativeValue callback
(<proxy.PropertyMetadata>common.HtmlView.htmlProperty.metadata).onSetNativeValue = onHtmlPropertyChanged;

global.moduleMerge(common, exports);

export class HtmlView extends common.HtmlView {
    private _ios: UILabel;

    constructor(options?: definition.Options) {
        super(options);

        this._ios = new UILabel();
        super._prepareNativeView(this._ios);
    }

    get ios(): UILabel {
        return this._ios;
    }

    get _nativeView(): UILabel {
        return this._ios;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        var nativeView = this._nativeView;
        if (nativeView) {

            var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
            var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);

            var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
            var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);

            if (widthMode === utils.layout.UNSPECIFIED) {
                width = Number.POSITIVE_INFINITY;
            }

            if (heightMode === utils.layout.UNSPECIFIED) {
                height = Number.POSITIVE_INFINITY;
            }

            var nativeSize = nativeView.sizeThatFits(CGSizeMake(width, height));
            var labelWidth = nativeSize.width;

            labelWidth = Math.min(labelWidth, width);

            var measureWidth = Math.max(labelWidth, this.minWidth);
            var measureHeight = Math.max(nativeSize.height, this.minHeight);

            var widthAndState = viewModule.View.resolveSizeAndState(measureWidth, width, widthMode, 0);
            var heightAndState = viewModule.View.resolveSizeAndState(measureHeight, height, heightMode, 0);

            this.setMeasuredDimension(widthAndState, heightAndState);
        }
    }
} 