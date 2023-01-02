// base - Product.find()
// bigQ - /product/search?name=hello&category=shirt&page=1&price[gt:200]&limit=5
// we will accept this bigQ as req.query(it is a object), so bigQ == req.query

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  //   product search
  search() {
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find({ ...searchword });
    return this;
  }

  //   filter, implementing gte,lte,gt,lt
  filter() {
    let copyQ = { ...this.bigQ };

    delete copyQ["search"];
    delete copyQ["page"];
    delete copyQ["limit"];

    // convert bigQ into a string
    let stringOfCopyQ = JSON.stringify(copyQ);
    const regex = /\b(gte|lte|gt|lt)\b/g;
    stringOfCopyQ = stringOfCopyQ.replace(regex, (m) => `$${m}`);

    const jsonOfCopyQ = JSON.parse(stringOfCopyQ);

    this.base = this.base.find(jsonOfCopyQ);
    return this;
  }

  //   result limit per page
  pager(resultPerPage) {
    let currentPage = 1;
    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }

    const skipVal = resultPerPage * (currentPage - 1);

    this.base = this.base.limit(resultPerPage).skip(skipVal);

    return this;
  }
}

module.exports = WhereClause;
