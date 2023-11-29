const REST = {
    async get(url) {
        let response = await fetch(url, {
            "method": "GET"
        });

        if (response.ok) {
            return await response.json();
        } else {
            return await response.text();
        }
    },
    
    async post(url, body) {
        let response = await fetch(url, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify(body)
        });
    
        if (response.ok) {
            return await response.json();
        } else {
            return await response.text();
        }
    }
};