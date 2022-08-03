const Store = {
    currentDate: {
        cursor: new Date(),
        get month() {
            return this.cursor.getMonth();
        },
        get year() {
            return this.cursor.getFullYear();
        },
        moveCursor: function(month) {
            this.cursor = new Date(this.cursor.setMonth(this.cursor.getMonth() + month));
        }
    }
}

export default Store;