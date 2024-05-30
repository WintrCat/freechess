// SpeechBubble.js
// Sunmock Yang, September 2015

function SpeechBubble(context) {
	this.context = context;

	// -- Attributes
	
	// Panel
	this.panelBounds = new SpeechBubble.Bounds(100, 100, 300, 100);
	this.cornerRadius = 10;
	this.padding = 10;
	this.panelBorderWidth = 2;
	this.panelBorderColor = "#333";
	this.panelFillColor = "#FFF";

	// Tail
	this.tailBaseWidth = 10;
	this.tailStyle = SpeechBubble.TAIL_CURVED;
	this.target = new SpeechBubble.Vector();
	
	// Text
	this.text = "";
	this.lineSpacing = 5;
	this.font = "Georgia";
	this.fontSize = 20;
	this.fontColor = "#900";
	this.textAlign = SpeechBubble.ALIGN_LEFT;
	this.overflow = SpeechBubble.OVERFLOW_VERTICAL_STRETCH;

	// Utility
	this.startTail = new SpeechBubble.BezierCurve(context, 20);
	this.startTail.addPoint(new SpeechBubble.Vector());
	this.startTail.addPoint(new SpeechBubble.Vector());
	this.startTail.addPoint(this.target);

	this.endTail = new SpeechBubble.BezierCurve(context, 20);
	this.endTail.addPoint(this.target);
	this.endTail.addPoint(new SpeechBubble.Vector());
	this.endTail.addPoint(new SpeechBubble.Vector());
};

SpeechBubble.Vector = function(x, y) {
	this.x = (typeof x != "undefined") ? x : 0;
	this.y = (typeof y != "undefined") ? y : 0;
};

SpeechBubble.Vector.prototype.add = function(b) {
	return new SpeechBubble.Vector(this.x + b.x, this.y + b.y);
};

SpeechBubble.Vector.prototype.sub = function(b) {
	return new SpeechBubble.Vector(this.x - b.x, this.y - b.y);
};

SpeechBubble.Vector.prototype.scale = function(t) {
	return new SpeechBubble.Vector(this.x * t, this.y * t);
};

SpeechBubble.Vector.prototype.mag = function() {
	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

SpeechBubble.TOP_SIDE = {name: "SPEECH_BUBBLE_TOP", normalVector: new SpeechBubble.Vector(0, -1), drawVector: new SpeechBubble.Vector(1, 0)};
SpeechBubble.BOTTOM_SIDE = {name: "SPEECH_BUBBLE_BOTTOM", normalVector: new SpeechBubble.Vector(0, 1), drawVector: new SpeechBubble.Vector(-1, 0)};
SpeechBubble.LEFT_SIDE = {name: "SPEECH_BUBBLE_LEFT", normalVector: new SpeechBubble.Vector(-1, 0), drawVector: new SpeechBubble.Vector(0, -1)};
SpeechBubble.RIGHT_SIDE = {name: "SPEECH_BUBBLE_RIGHT", normalVector: new SpeechBubble.Vector(1, 0), drawVector: new SpeechBubble.Vector(0, 1)};

SpeechBubble.ALIGN_LEFT = "SPEECH_BUBBLE_ALIGN_LEFT";
SpeechBubble.ALIGN_RIGHT = "SPEECH_BUBBLE_ALIGN_RIGHT";
SpeechBubble.ALIGN_CENTER = "SPEECH_BUBBLE_ALIGN_CENTER";

SpeechBubble.TAIL_STRAIGHT = "SPEECH_BUBBLE_TAIL_STRAIGHT";
SpeechBubble.TAIL_CURVED = "SPEECH_BUBBLE_TAIL_CURVED";

SpeechBubble.OVERFLOW_NONE = "SPEECH_BUBBLE_OVERFLOW_NONE";
SpeechBubble.OVERFLOW_ELLIPSIS = "SPEECH_BUBBLE_OVERFLOW_ELLIPSIS";
SpeechBubble.OVERFLOW_VERTICAL_STRETCH = "SPEECH_BUBBLE_OVERFLOW_VERTICAL_STRETCH";
SpeechBubble.OVERFLOW_HIDDEN = "SPEECH_BUBBLE_OVERFLOW_HIDDEN";

SpeechBubble.prototype.setTargetPos = function(x, y) {
	this.target = new SpeechBubble.Vector(x, y);
};

SpeechBubble.prototype.draw = function() {
	var formattedText = this.formatText();

	if (this.overflow == SpeechBubble.OVERFLOW_VERTICAL_STRETCH)
	{
		this.panelBounds.setSize(this.panelBounds.width, formattedText.height);
	}
	else // OVERFLOW_NONE, OVERFLOW_HIDDEN, OVERFLOW_ELLIPSIS
	{
		// Don't reset the size
	}

	var tailLocation = this.getTailLocation();

	this.context.beginPath();
	this.context.moveTo(this.panelBounds.left + this.cornerRadius, this.panelBounds.top);

	var cornerAngle = 1.5 * Math.PI;

	this.context.lineWidth = this.panelBorderWidth;
	this.drawPanelWall(SpeechBubble.TOP_SIDE, tailLocation, this.panelBounds.right - this.cornerRadius, this.panelBounds.top);
	this.drawPanelCorners(this.panelBounds.right - this.cornerRadius, this.panelBounds.top + this.cornerRadius, cornerAngle, cornerAngle += 0.5 * Math.PI);

	this.drawPanelWall(SpeechBubble.RIGHT_SIDE, tailLocation, this.panelBounds.right, this.panelBounds.bottom - this.cornerRadius);
	this.drawPanelCorners(this.panelBounds.right - this.cornerRadius, this.panelBounds.bottom - this.cornerRadius, cornerAngle, cornerAngle += 0.5 * Math.PI);

	this.drawPanelWall(SpeechBubble.BOTTOM_SIDE, tailLocation, this.panelBounds.left + this.cornerRadius, this.panelBounds.bottom);
	this.drawPanelCorners(this.panelBounds.left + this.cornerRadius, this.panelBounds.bottom - this.cornerRadius, cornerAngle, cornerAngle += 0.5 * Math.PI);

	this.drawPanelWall(SpeechBubble.LEFT_SIDE, tailLocation, this.panelBounds.left, this.panelBounds.top + this.cornerRadius);
	this.drawPanelCorners(this.panelBounds.left + this.cornerRadius, this.panelBounds.top + this.cornerRadius, cornerAngle, cornerAngle += 0.5 * Math.PI);

	this.context.fillStyle = this.panelFillColor;
	this.context.fill();

	this.context.strokeStyle = this.panelBorderColor;
	this.context.stroke();
	
	this.context.closePath();

	this.drawText(formattedText.lines);
	// this.drawDebug();
};

// Takes the entire input text string and:
// - Measures the text using the set font
// - Returns an array of strings using the input text where
//   each element is a line that will fit within the set bounds
// - Also returns the height of the text that was formatted.
SpeechBubble.prototype.formatText = function() {
	var words = this.text.split(" ");

	if (words.length == 0)
		return;

	this.context.font = this.fontSize + "px " + this.font;

	var lines = [words[0]];
	var lineLength = this.context.measureText(words[0]).width;
	var height = this.cornerRadius * 2 + this.padding * 2 + this.fontSize;
	var ellipsisLength = this.context.measureText("...").width;

	for (var i = 1; i < words.length; i++) {
		var lineNum = lines.length - 1;
		var wordLength = this.context.measureText(" " + words[i]).width;

		// If the overflow is ellipsis and adding a new word + ellipsis will overflow
		// and it's the last possible line in the panel, then add ellipsis
		if (this.overflow == SpeechBubble.OVERFLOW_ELLIPSIS &&
			lineLength + wordLength + ellipsisLength > this.getSafeSpace().width &&
			this.panelBounds.height < height + this.fontSize + this.lineSpacing)
		{
			lines[lineNum] += "...";
			lineLength += ellipsisLength;
		}

		// If the current line + the new word fits within the safe space
		if (lineLength + wordLength < this.getSafeSpace().width) {
			lines[lineNum] += " " + words[i];
			lineLength += wordLength;
		}
		else {
			// Add the next line of text as long as  overflow is vertical stretch/none
			// or in bounds.
			if (this.overflow == SpeechBubble.OVERFLOW_VERTICAL_STRETCH ||
				this.overflow == SpeechBubble.OVERFLOW_NONE ||
				this.panelBounds.height > height + this.fontSize + this.lineSpacing) {
				lines.push(words[i]);
				lineLength = this.context.measureText(words[i]).width;
				height += this.fontSize + this.lineSpacing;
			}
			else {
				break;
			}
		}
	};

	return {
		height: height,
		lines: lines
	};
};

// Returns a bound that depicts the area the text will appear in
SpeechBubble.prototype.getSafeSpace = function() {
	var left = this.panelBounds.left + this.padding + this.cornerRadius;
	var top = this.panelBounds.top + this.padding + this.cornerRadius;
	var width = this.panelBounds.width - this.padding * 2 - this.cornerRadius * 2;
	var height = this.panelBounds.height - this.padding * 2 - this.cornerRadius * 2;

	return new SpeechBubble.Bounds(left, top, width, height);
};

SpeechBubble.prototype.drawText = function(lines) {
	this.context.font = this.fontSize + "px " + this.font;
	this.context.fillStyle = this.fontColor;
	this.context.textBaseline = "hanging";

	var verticalOffset = this.padding + this.cornerRadius;
	var horizontalOffset = this.panelBounds.left + this.padding + this.cornerRadius;

	for (var i = 0; i < lines.length; i++) {
		switch (this.textAlign) {
			case SpeechBubble.ALIGN_RIGHT:
				horizontalOffset = this.panelBounds.left + this.panelBounds.width - (this.padding + this.cornerRadius) - this.context.measureText(lines[i]).width;
			break;

			case SpeechBubble.ALIGN_CENTER:
				horizontalOffset = this.panelBounds.left + (this.panelBounds.width - this.context.measureText(lines[i]).width) / 2;
			break;
		}

		this.context.fillText(lines[i], horizontalOffset, this.panelBounds.top + verticalOffset);
		verticalOffset += this.fontSize + this.lineSpacing;
	};
};

SpeechBubble.prototype.drawPanelWall = function(panelSide, tailLocation, toX, toY) {
	if (panelSide == tailLocation.side && !this.panelBounds.inBounds(this.target.x, this.target.y)) {
		var tailBaseVector = panelSide.drawVector.scale(this.tailBaseWidth);
		var start = tailLocation.sub(tailBaseVector);
		var end = tailLocation.add(tailBaseVector);

		this.drawTail(panelSide, start, end);
	}

	this.context.lineTo(toX, toY);
};

SpeechBubble.prototype.drawTail = function(panelSide, start, end) {

	if (this.tailStyle == SpeechBubble.TAIL_STRAIGHT) {
		this.context.lineTo(start.x, start.y);
		this.context.lineTo(this.target.x, this.target.y);
		this.context.lineTo(end.x, end.y);
	}
	else if (this.tailStyle == SpeechBubble.TAIL_CURVED) {
		var deltaVec = this.target.sub(this.getTailLocation());
		deltaVec.x = deltaVec.x * panelSide.normalVector.x;
		deltaVec.y = deltaVec.y * panelSide.normalVector.y;
		var tailHalfLength = Math.pow(deltaVec.mag(), 0.7);

		this.startTail.points[0] = start;
		this.startTail.points[1] = start.add(panelSide.normalVector.scale(tailHalfLength));
		this.startTail.points[2] = this.target;
		this.startTail.draw();

		this.endTail.points[0] = this.target;
		this.endTail.points[1] = end.add(panelSide.normalVector.scale(tailHalfLength));
		this.endTail.points[2] = end;
		this.endTail.draw();
	}
};

SpeechBubble.prototype.drawPanelCorners = function(x, y, startAngle, endAngle) {
	if (this.cornerRadius > 0) {
		this.context.arc(x, y, this.cornerRadius, startAngle, endAngle);
	}
};

SpeechBubble.prototype.getTailLocation = function() {
	var x = 0, y = 0;
	var side = "";

	var boundsCenter = this.panelBounds.getCenter();
	var relativeTargetX = this.target.x - boundsCenter.x;
	var relativeTargetY = this.target.y - boundsCenter.y;

	var targetAspectRatio = relativeTargetX / relativeTargetY;
	var boundsAspectRatio = this.panelBounds.width / this.panelBounds.height;

	if (Math.abs(targetAspectRatio) < Math.abs(boundsAspectRatio))
	{
		// Top/bottom
		y = this.panelBounds.height/2 * Math.sign(relativeTargetY);
		x = relativeTargetX * (y / relativeTargetY);
		side = (Math.sign(relativeTargetY) > 0) ? SpeechBubble.BOTTOM_SIDE : SpeechBubble.TOP_SIDE;
		x = SpeechBubble.Utils.clamp(x, this.cornerRadius + this.tailBaseWidth - this.panelBounds.width/2, this.panelBounds.width/2 - this.tailBaseWidth - this.cornerRadius);
	}
	else
	{
		// Sides
		x = this.panelBounds.width/2 * Math.sign(relativeTargetX);
		y = relativeTargetY * (x / relativeTargetX);
		side = (Math.sign(relativeTargetX) > 0) ? SpeechBubble.RIGHT_SIDE : SpeechBubble.LEFT_SIDE;
		y = SpeechBubble.Utils.clamp(y, this.cornerRadius + this.tailBaseWidth - this.panelBounds.height/2, this.panelBounds.height/2 - this.tailBaseWidth - this.cornerRadius);
	}

	x += boundsCenter.x;
	y += boundsCenter.y;

	var location = new SpeechBubble.Vector(x, y);
	location.side = side;

	return location;
};

SpeechBubble.prototype.drawDebug = function() {
	this.context.strokeStyle = "#00F";
	this.context.strokeRect(this.getSafeSpace().left, this.getSafeSpace().top, this.getSafeSpace().width, this.getSafeSpace().height);

	this.context.strokeStyle = "#F00";
	this.context.beginPath();
	this.context.moveTo(this.panelBounds.getCenter().x, this.panelBounds.getCenter().y);
	this.context.lineTo(this.getTailLocation().x, this.getTailLocation().y);
	this.context.stroke();
	this.context.closePath();

	this.context.fillStyle = "#0F0";
	this.debugSquare(this.target);
	this.debugSquare(this.panelBounds.getCenter());
	this.debugSquare(this.getTailLocation());
};

SpeechBubble.prototype.debugSquare = function(point) {
	this.context.fillRect(point.x - 2, point.y - 2, 5, 5);
};

SpeechBubble.BezierCurve = function(context, resolution) {
	this.context = context;
	this.points = [];
	this.resolution = resolution;
};

SpeechBubble.BezierCurve.prototype.addPoint = function(point) {
	this.points.push(point);
};

SpeechBubble.BezierCurve.prototype.draw = function() {
	for (var i = 0; i <= this.resolution; i++) {
		var point = this.getPoint(i/this.resolution);
		this.context.lineTo(point.x, point.y);
	};
};

SpeechBubble.BezierCurve.prototype.getPoint = function(t) {
	var point = new SpeechBubble.Vector();
	var n = this.points.length - 1;

	for (var i = 0; i < this.points.length; i++) {
		var scale = Math.pow(1-t, n-i) * Math.pow(t, i) * SpeechBubble.Utils.binomialCoefficient(n, i);
		var scaledVector = this.points[i].scale(scale);

		point = point.add(scaledVector);
	};

	return point;
};

SpeechBubble.Utils = {};
SpeechBubble.Utils.clamp = function(val, min, max) {
	return Math.min(Math.max(val, min), max);
};

SpeechBubble.Utils.binomialCoefficient = function(n, k) {
	// http://rosettacode.org/wiki/Evaluate_binomial_coefficients#JavaScript
    var coeff = 1;
    for (var i = n-k+1; i <= n; i++) coeff *= i;
    for (var i = 1;     i <= k; i++) coeff /= i;
    return coeff;
};

SpeechBubble.Bounds = function(top, left, width, height){
	this.top = (top) ? top : 0;
	this.left = (left) ? left : 0;
	this.width = (width) ? width : 0;
	this.height = (height) ? height : 0;

	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
};

SpeechBubble.Bounds.prototype.move = function(left, top) {
	this.top = top;
	this.left = left;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
};

SpeechBubble.Bounds.prototype.setSize = function(width, height) {
	this.width = width;
	this.height = height;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
};

SpeechBubble.Bounds.prototype.getCenter = function() {
	return {
		x: this.left + this.width/2,
		y: this.top + this.height/2
	}
};

SpeechBubble.Bounds.prototype.inBounds = function(x, y) {
	return (x > this.left &&
		x < this.left + this.width &&
		y > this.top &&
		y < this.top + this.height);
};

// Give a point in global space, return point in bound space
SpeechBubble.Bounds.prototype.relativePoint = function(x, y) {
	return {
		x: x - this.left,
		y: y - this.top
	};
};


// Attach to window object
window.SpeechBubble = SpeechBubble;