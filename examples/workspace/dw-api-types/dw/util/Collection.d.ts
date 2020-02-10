
import Iterator = require('./Iterator');

/**
 * Represents a collection of objects.
 */
declare class Collection<T> {


    /**
     * Returns true if the collection is empty.
     */
    empty : boolean;

    /**
     * The length of the collection. This is similar to to a ECMA array of 'products.length'.
     */
    length : number;


    /**
     * Returns the size of the collection.
     */
    size() : number;


    /**
     * Returns a subset of the elements of this collection in a newly created array. The returned array is independent of this collection and can be modified without changing the collection. The elements in the array are in the same order as they are returned when iterating over this collection.
     * @param start - the number of elements to iterate before adding elements to the array. Negative values are treated as 0.
     * @param size - the maximum number of elements to add to the array. Nonpositive values always result in empty array.
     */
    toArray(start: number, size: number) : Array<T>;

    /**
     * Returns all elements of this collection in a newly created array. The returned array is independent of this collection and can be modified without changing the collection. The elements in the array are in the same order as they are returned when iterating over this collection.
     */
    toArray() : Array<T>;

    /**
     * Removes all of object in the collection that are not in the specified collection.
     * @param collection -  the collection of objects to retain in the collection.
     */
    retainAll(collection: Collection<T>) : boolean;

    /**
     * Removes all of object in the specified object from the collection.
     * @param collection - the collection of objects to retain in the collection.
     */
    removeAll(collection: Collection<T>) : boolean;

    /**
     * Removes the specified object from the collection.
     * @param T - the object to remove.
     */
    remove(t: T) : boolean;

    /**
     * Returns an iterator that can be used to access the members of the collection.
     */
    iterator() : Iterator<T>;

    /**
     * Returns true if the collection is empty.
     */
    isEmpty() : boolean;

    /**
     * Returns the length of the collection. This is similar to to a ECMA array of 'products.length'.
     */
    getLength() : number;

    /**
     * Returns true if the collection contains all of the objects in the specified collection.
     * @param collection - the collection of objects to locate in this collection.
     */
    containsAll(collection : Collection<T>) : boolean;

    /**
     * Returns true if the collection contains the specified object.
     * @param value the object to locate in this collection.
     */
    contains(value: T) : boolean;

    /**
     * Clears the collection.
     */
    clear() : void;

    /**
     * Adds the collection of objects to the collection.
     * @param collection - the objects to add.
     */
    addAll(collection: Collection<T>) : boolean;

    /**
     * The method adds a single object to the collection.
     * @param t - the object to add.
     */
    add1(value: T) : boolean;

    /**
     * Adds the specified objects to the collection. The method can also be called with an ECMA array as argument. If called with a single ECMA array as argument the individual elements of that array are added to the collection. If the array object itself should be added use the method add1().
     * @param t  the values to add.
     */
    add(...values: T[]) : boolean;

}

export = Collection;
