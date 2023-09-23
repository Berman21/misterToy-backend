import fs from 'fs'
import { utilService } from './util.service.js'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy, sort) {
    if (!filterBy) return Promise.resolve(toys)

    let toysToDisplay = toys
    if (filterBy.search) {
        const regExp = new RegExp(filterBy.txt, 'i')
        toysToDisplay = toysToDisplay.filter(toy => regExp.test(toy.name))
    }
    if (filterBy.labels && filterBy.labels[0]) {
        toysToDisplay = toysToDisplay.filter(toy => toy.labels.some(label => filterBy.labels.includes(label)))
    }

    if (filterBy.inStock) { 
        toysToDisplay = toysToDisplay.filter(toy => toy.inStock === JSON.parse(filterBy.inStock))
    }

    filterBy.maxPrice = (+filterBy.maxPrice) ? +filterBy.maxPrice : Infinity
    filterBy.minPrice = (+filterBy.minPrice) ? +filterBy.minPrice : -Infinity

    toysToDisplay = toysToDisplay.filter(toy => (toy.price <= filterBy.maxPrice) && (toy.price >= filterBy.minPrice))


    // sort either by price or by name - when sorting by string we need more 
    // complex conditions, thats for you to figure out ;)
    // we use the asc key in the sort to determin which way to sort
    // ascending or descending. so when we change the number to pos \ neg 
    // it will change the direction of the sort
    toysToDisplay.sort((toy1, toy2) => {
        const dir = JSON.parse(sort.asc) ? 1 : -1
        if (sort.by === 'price') return (toy1.price - toy2.price) * dir
        if (sort.by === 'name') return toy1.name.localeCompare(toy2.name) * dir
    })

    return Promise.resolve(toysToDisplay);
}

function getById(_id) {
    const toy = toys.find(toy => toy._id === _id)
    if (!toy) return Promise.reject('Toy not found!')
    return Promise.resolve(toy);
}

function remove(_id) {
    const idx = toys.findIndex(toy => toy._id === _id)
    if (idx === -1) return Promise.reject('No Such Toy')
    toys.splice(idx, 1);
    _saveToysToFile()
    return Promise.resolve();
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy.createdAt = new Date(Date.now());
        toy._id = _makeId();
        toys.unshift(toy);
    }
    _saveToysToFile();
    return Promise.resolve(toy);
}



function _makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}

function _saveToysToFile() {
    fs.writeFileSync('data/toy.json', JSON.stringify(toys, null, 2));
}
