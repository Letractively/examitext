/* This class provides very basic coroutine functionality. Simply add tasks
 * the task queue and then call start() to have them executed in the
 * background, in the order they were added. A task is simply a class that
 * has implemented a method called run() which takes one parameter.
 *
 * NOTE: While there is a global instance created already, it is possible
 * to make your own instances of TaskQueue if you want multiple queues
 * running. */

/* Start of class TaskQueue */
function TaskQueue(updateInterval) {
	this.updateInterval = updateInterval;
	this.reset();
}

TaskQueue.prototype.update = function() {
	var temp = this.currentTask.run(this.returnValue);
	if (temp) { // if non-zero(false) defined value returned
		this.tasks.splice(0, 1);
		if (this.tasks.length > 0) {
			this.currentTask = this.tasks[0];
			this.returnValue = temp;
		// If there are no more tasks left, just stop the queue from running
		} else {
			this.stop();
		}
	}
}

TaskQueue.prototype.add = function (task) {
	this.tasks.push(task);
}

TaskQueue.prototype.start = function () {
	if (this.running || this.tasks.length == 0) return false;

	this.currentTask = this.tasks[0];
	// NOTE: Put in function since it was recommended that
	// setInterval() should use a function and NOT a string)
	this.intervalID = setInterval(function() { TaskQueue.instance.update() }, this.updateInterval);
	this.running = true;
	return true;
}

TaskQueue.prototype.stop = function () {
	if (this.running) {
		clearInterval(this.intervalID);
		this.reset();
		return true;
	} else {
		return false;
	}
}


TaskQueue.prototype.reset = function () {
	this.intervalID = 0;
	this.running = false;
	this.tasks = []; // removes all scheduled tasks
	this.currentTask = undefined;
	this.returnValue = undefined;
}

TaskQueue.instance = new TaskQueue(20);

/* End of class TaskQueue */

/* Start of class FunctionWrapper
 * Utility class which wraps a single function so it can be
 * added the TaskQueue and called once. */
function FunctionWrapper(func) {
	this.func = func;
}

FunctionWrapper.prototype.run = function(value) {
	var returnValue = this.func(value);
	return (returnValue == undefined) ? true : returnValue;
}

/* End of class FunctionWrapper */