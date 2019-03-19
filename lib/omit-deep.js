function omitDeep(collection, excludeKeys) {
  if (!collection || typeof collection !== 'object') {
    return collection;
  }

  return Object.keys(collection).reduce((result, key) => {
    if (!excludeKeys.includes(key)) {
      if (typeof collection[key] === 'object') {
        result[key] = omitDeep(collection[key], excludeKeys);
      } else {
        result[key] = collection[key];
      }
    }

    return result;
  }, {});
}

module.exports = omitDeep;
