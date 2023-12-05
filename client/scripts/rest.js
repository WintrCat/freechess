const REST = {
    async get(url) {
        try {
            let response = await fetch(url, {
                method: "GET",
            });

            if (response.ok) {
                return await response.json();
            } else {
                return response.statusText;
            }
        } catch (err) {
            return "Failed for unknown reason.";
        }
    },

    async post(url, body) {
        try {
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                return await response.json();
            } else {
                return response.statusText;
            }
        } catch (err) {
            return "Failed for unknown reason.";
        }
    },
};
