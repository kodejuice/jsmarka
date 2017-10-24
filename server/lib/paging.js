/*
	Paging script for jsmarka

	Sochima Biereagu, @KodeJuice
*/

const [min, max, ceil] = [Math.min, Math.max, Math.ceil];


function _link(url, name, start, isCurrent = false) {
	return '<li>'+(isCurrent ?
		` <span class='paging-link current'>${name}</span> ` :
		` <a class='paging-link' href="${url}&s=${start}"> ${name} </a>`) + '</li>';
}

function paging(url, allDataCount, startAt, maxItems) {
	maxItems -= 1;

	let pages = ceil(allDataCount / maxItems);
	let curpage = ~~(startAt / maxItems);

	let res = `<nav center aria-label="Page navigation">
				  <ul class="pagination">`;

	if (allDataCount > maxItems){
		res += (startAt > 0) ? _link(url, "Prev", curpage - 1) : "";

		for (let x = max(1, curpage - 5); x < min(curpage + 5, pages); x += 1){
			x = ~~x;
			res += _link(url, x, x, x === curpage);
		}
	
		res += ((curpage + 1 <= pages) ? _link(url, "Next", curpage + 1) : "");
	}


	return `${res} </ul> </nav>`;
}


module.exports = paging;