(function () {
    const DB_NAME = "TodoList";
    const DB_VERSION = 1;
    const DB_STORE_NAME = "Todo";

    let db;

    function alert(message) {
        document.querySelector("#alert").innerText = message;
        setTimeout(() => {
            document.querySelector("#alert").innerText = "";
        }, 3000);
    }

    function openDB() {
        console.log("正在打开 IndexedDB 数据库...");

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            // 针对此数据库请求的所有错误的通用错误处理器！
            console.error(`IndexedDB 数据库打开错误！${event.target.error}`);
            alert("为什么不允许我的 web 应用使用 IndexedDB！")
        };

        request.onblocked = (event) => {
            // 如果其他的一些页签加载了该数据库，在我们继续之前需要关闭它们。
            console.error(`IndexedDB 数据库打开被阻止！${event.target.error}`);
            alert("请关闭其他打开了该站点的标签页！");
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            useDB(db);
            console.log("IndexedDB 数据库打开成功！");
            render();
        };

        request.onupgradeneeded = function (event) {
            // 其他的数据库已经被关闭，一切就绪。
            console.log("IndexedDB 数据库升级中...");
            const store = event.currentTarget.result.createObjectStore(DB_STORE_NAME, {
                keyPath: "id",
                autoIncrement: true
            });
            store.createIndex("name", "name", {unique: true});
            store.createIndex("done", "done", {unique: false});
            console.log("IndexedDB 数据库升级完成！");
        };

    }

    function useDB(db) {
        // 请确保添加了在其他标签页请求了版本变更时会被通知的事件处理器。
        // 我们必须关闭数据库。这允许其他标签页更新数据库。
        // 如果不这样做，在用户关闭这些标签页之前，版本升级将不会发生。
        db.onversionchange = (event) => {
            console.log(`IndexedDB 数据库版本变更...${event.target.result}`);
            db.close();
            console.log("此页面的新版本已准备就绪。请重新加载或关闭此标签页！");
        };
    }

    function add(data) {
        const transaction = db.transaction(DB_STORE_NAME, "readwrite");
        const store = transaction.objectStore(DB_STORE_NAME);
        const request = store.add(data);

        request.onsuccess = (event) => {
            console.log(`添加数据成功！${event.target.result}`);
        };

        request.onerror = (event) => {
            console.error(`添加数据失败！${event.target.error}`);
            alert(`添加数据失败！${event.target.error}`)
        };
    }

    function put(data) {
        const transaction = db.transaction(DB_STORE_NAME, "readwrite");
        const store = transaction.objectStore(DB_STORE_NAME);
        const request = store.put(data);

        request.onsuccess = (event) => {
            console.log(`更新数据成功！${event.target.result}`);
        };

        request.onerror = (event) => {
            console.error(`更新数据失败！${event.target.error}`);
            alert(`更新数据失败！${event.target.error}`)
        };
    }

    function del(id) {
        const transaction = db.transaction(DB_STORE_NAME, "readwrite");
        const store = transaction.objectStore(DB_STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = (event) => {
            console.log(`删除数据成功！${event.target.result}`);
        };

        request.onerror = (event) => {
            console.error(`删除数据失败！${event.target.error}`);
            alert(`删除数据失败！${event.target.error}`)
        };
    }

    function render() {
        const transaction = db.transaction(DB_STORE_NAME, "readonly");
        const store = transaction.objectStore(DB_STORE_NAME);
        const request = store.getAll();

        request.onsuccess = (event) => {
            const data = event.target.result;
            const list = document.querySelector("#list");
            list.innerHTML = "";
            data.forEach(item => {
                list.innerHTML += `
          <div>
            <input type="hidden" value="${item.id}">
            <input type="checkbox" class="done" ${item.done ? "checked" : ""}/>
            <input type="text" value="${item.name}" readonly>
            <button class="del">-</button>
          </div>
          `;
            });
        };

        request.onerror = (event) => {
            console.error(`获取数据失败！${event.target.error}`);
        };
    }

    openDB();

    document.querySelector("#add").addEventListener("click", () => {
        const name = document.querySelector("#name").value;
        const done = document.querySelector("#done").checked;
        add({name, done});
        render();
    });

    document.querySelector("#list")?.addEventListener("click", (event) => {
        const target = event.target;
        if (target.className === "done") {
            let id = target.parentElement.querySelector("input[type=hidden]").value;
            const name = target.parentElement.querySelector("input[type=text]").value;
            const done = target.checked;
            id = parseInt(id);
            put({id, name, done});
        } else if (target.className === "del") {
            let id = target.parentElement.querySelector("input[type=hidden]").value;
            id = parseInt(id);
            del(id);
        }
        render();
    });

})();